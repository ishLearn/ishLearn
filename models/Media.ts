import { Upload } from '@aws-sdk/lib-storage'
import express from 'express'
import { v4 as uuid } from 'uuid'

import socket from 'socket.io'

import { SearchFileBucketParams, UploadBucketParams } from '../libs/aws/types'
import { createParallelUploads3 } from '../libs/aws/upload'
import Logger from '../utils/Logger'
import { s3Client } from '../libs/aws/s3Client'
import {
  GetObjectCommand,
  GetObjectTaggingCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3'
import { Readable } from 'stream'
import { UserRecord } from '../types/users'

type UploadClient = { u: Upload; c?: socket.Socket }

/**
 * Handle Media up- and downloads.
 *
 * @author @SebastianThomas
 */
export default class Media {
  /**
   * The map to save currently active upload sessions and Socket.io clients to.
   */
  static uploads: Map<string, UploadClient> = new Map<string, UploadClient>()

  /**
   * Get client from the uploads map.
   * @param id the Upload ID to search for (uuid given on init)
   * @returns the found Entry from the Map (UploadClient)
   */
  static getUpload(id: string): UploadClient | undefined {
    return Media.uploads.get(id)
  }

  /**
   * Upload a File to S3
   * @param fileName The filename to save the Media to.
   * @param buf The Buffer to save
   * @param res The express response object to send success or error to client.
   */
  static uploadMedia(
    fileName: string,
    buf: Buffer,
    res: express.Response<{}, UserRecord>
  ) {
    if (typeof process.env.MAIN_BUCKET === 'undefined')
      throw new Error('Process env is not correctly set up for S3')

    const params: UploadBucketParams = {
      Bucket: process.env.MAIN_BUCKET,
      Key: `${fileName}`,
      Body: buf,
    }

    const upload = createParallelUploads3(params)

    const newUploadId = uuid()
    Media.uploads.set(newUploadId, { u: upload })

    let client: socket.Socket | undefined = undefined

    upload.on('httpUploadProgress', stream => {
      console.log('Uploaded more data ' + stream.Key + '; ID: ' + newUploadId)

      if (typeof client === 'undefined') {
        client = Media.uploads.get(newUploadId)?.c
      }
      try {
        client?.emit('uploadDataUpdate', {
          part: stream.part,
          loaded: stream.loaded,
          total: stream.total,
          id: newUploadId,
          filename: stream.Key?.substring(
            stream.Key.lastIndexOf('/'),
            stream.Key.length
          ),
        })
      } catch (err) {
        new Logger().error(
          'Socket.IO emit',
          'Emit uploadDataUpdate to client',
          err
        )
      }
    })

    // Send 'partial content'-header, success and uploadId
    res.status(206).json({
      success: true,
      uploadId: newUploadId,
    })

    // Wait for upload to finish and then emit finish event to socket, if present
    upload.done().then(() => {
      try {
        client?.emit('uploadDone', {
          id: newUploadId,
        })
      } catch (err) {
        new Logger().error(
          'Socket.IO emit',
          'Emit uploadDataUpdate to client',
          err
        )
      }
    })
  }

  /**
   * Send a file to client with the specified filename.
   * @param filename The filename (complete path!) to search for in default bucket
   * @param res the Express response object to return data to client
   * @returns The express response object after sending headers and body content
   */
  static async downloadMedia(
    filename: string,
    res: express.Response<{}, UserRecord>
  ) {
    // TODO: Testing needed One minute for testing, what time to use?
    const cacheExpiration = 1000 * 60
    const streamTags = true

    const bucketParams: SearchFileBucketParams = {
      Bucket: process.env.MAIN_BUCKET || 'main',
      Key: filename,
    }

    try {
      // Head the object to get classic the bare minimum http-headers information
      const headResponse = await s3Client.send(
        new HeadObjectCommand(bucketParams)
      )
      res.set({
        'Content-Length': headResponse.ContentLength,
        'Content-Type': headResponse.ContentType,
        ETag: headResponse.ETag,
      })
      // Get the object taggings (optional)
      if (streamTags === true) {
        const taggingResponse = await s3Client.send(
          new GetObjectTaggingCommand(bucketParams)
        )
        taggingResponse.TagSet?.forEach(tag => {
          res.set('X-TAG-' + tag.Key, tag.Value)
        })
      }
      // Prepare cache headers
      if (typeof cacheExpiration === 'number') {
        res.setHeader(
          'Cache-Control',
          'public, max-age=' + cacheExpiration / 1000
        )
        res.setHeader(
          'Expires',
          new Date(Date.now() + cacheExpiration).toUTCString()
        )
      } else {
        res.setHeader('Pragma', 'no-cache')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Expires', 0)
      }

      // Now get the object data and stream it
      const response = await s3Client.send(new GetObjectCommand(bucketParams))
      const body = response.Body
      if (typeof body === 'undefined')
        return res
          .status(404)
          .json({ msg: 'Not Found', error: 'File not found' })

      const stream = body as Readable

      let chunkId = 0
      stream.on('data', chunk => {
        console.log('Sending chunk: ' + chunkId)
        res.write(chunk)
        chunkId++
      })
      stream.once('end', () => {
        return res.end()
      })
      stream.once('error', () => {
        return res.end()
      })
    } catch (err: any) {
      if (err['$metadata'].httpStatusCode === 404)
        return res.status(404).json({ msg: 'File not found' })
      return res.status(err['$metadata'].httpStatusCode || 500).json({ err })
    }
  }
}
