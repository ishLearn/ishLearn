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

type UploadClient = { u: Upload; c?: socket.Socket }

export default class Media {
  static uploads: Map<string, UploadClient> = new Map<string, UploadClient>()

  static getUpload(id: string): UploadClient | undefined {
    return Media.uploads.get(id)
  }

  static uploadMedia(fileName: string, buf: Buffer, res: express.Response) {
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
    // TODO: Documentation for 'uploadDataUpdate'-event, 'uploadDone'-event emitted to socket client

    let client: socket.Socket | undefined = undefined

    upload.on('httpUploadProgress', stream => {
      console.log('Uploaded more data')
      console.log(stream)

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

  static async downloadMedia(filename: string, res: express.Response) {
    // TODO: One minute for testing
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

      let chunkid = 0
      stream.on('data', chunk => {
        console.log('Sending chunk: ' + chunkid)
        res.write(chunk)
        chunkid++
      })
      stream.once('end', () => {
        res.end()
      })
      stream.once('error', () => {
        res.end()
      })
    } catch (err: any) {
      if (err['$metadata'].httpStatusCode === 404)
        return res.status(404).json({ msg: 'File not found' })
      return res.status(err['$metadata'].httpStatusCode || 500).json({ err })
    }
  }
}
