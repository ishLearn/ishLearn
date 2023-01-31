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
import DBService, { getIntIDFromHash } from '../services/DBService'
import chalk from 'chalk'
import { NumberLike } from 'hashids/cjs/util'
import Product from './Product'

type UploadClient = { u: Upload; c?: socket.Socket }

export type MediaPartOfProduct = {
  MID: number
  PID: number
  filename: string
  URL: string
  filetype: string
}

export type MediaPartOfProductJoin = MediaPartOfProduct & Product

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
   * Get the filename to a file belonging to a project.
   *
   * TODO:? Filename may not be unique
   *
   * @param file Filename of the new file
   * @param project Project ID (hashed) the new media belongs to
   * @returns The complete file path including the project ID and the name
   */
  static getFilename(file: string, project: string) {
    return `${project}/${file}`.replace(/[^a-z0-9\.\/-]/gi, '_')
  }

  /**
   * Save a new Media to SQL; into `media` and into `mediaPartOfProduct` table
   * @param filename name of the file
   * @param filePath file path including name of the file
   * @param project ProjectID (hashed)
   * @returns The new Media's ID
   */
  static async save(
    filename: string,
    filePath: string,
    fileType: string,
    project: string | NumberLike,
    cId: string | NumberLike
  ) {
    const mediaPartOfProduct = await new DBService().query(
      `INSERT INTO media (filename, URL, filetype) VALUES (?, ?, ?)`,
      [filename, filePath, fileType]
    )

    const collaborator = typeof cId === 'string' ? getIntIDFromHash(cId) : cId

    await Product.addMedia(
      typeof project === 'string' ? getIntIDFromHash(project) : project,
      collaborator,
      mediaPartOfProduct.results.insertId
    )
    return mediaPartOfProduct.results.insertId as NumberLike
  }

  static async saveToMediaOnly(
    filename: string,
    filePath: string,
    fileType?: string
  ) {
    const newMedia = await new DBService().query(
      `INSERT INTO media (filename, URL, filetype) VALUES (?, ?, ?)`,
      [filename, filePath, fileType]
    )
    return newMedia.results.insertId as NumberLike
  }

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
   * @param config
   * - `res`: The express response object to send success or error to client.
   */
  static async uploadMedia(
    fileName: string,
    buf: Buffer,
    config?: {
      project?: string
      userId?: string | NumberLike
      res?: express.Response<{}, UserRecord>
      useNameAsPath?: boolean
      fileType: string
    },
    overrideIfNecessary?: boolean
  ) {
    // Ensure filename is provided
    if (typeof fileName === 'undefined' || fileName === '')
      return config?.res
        ?.status(400)
        .json({ error: 'Please specify filename.' })

    // Escape special characters with underscores
    const filePathName = config?.useNameAsPath
      ? fileName.replace(/[^a-z0-9\.\/-]/gi, '_')
      : Media.getFilename(fileName, config?.project || '')

    // Get files with same name at same project
    const { results } = config?.project
      ? await new DBService().query(
          `SELECT * FROM mediaPartOfProduct INNER JOIN media ON media.ID = mediaPartOfProduct.MID WHERE PID = ? AND URL = ?`,
          [getIntIDFromHash(config?.project), filePathName]
        )
      : { results: [] }
    // Cancel if the file or a similar has already been saved
    if (!overrideIfNecessary) {
      if (results.length > 0)
        throw new Error(
          `A File with same or similar name is already saved for this project.`
        )
    } else {
      await Promise.all(
        results.map((result: { MID: NumberLike }) =>
          new DBService().query(
            `DELETE FROM mediaPartOfProduct WHERE MID = ?`,
            [result.MID]
          )
        )
      )
    }

    // Ensure Process ENV is correctly set up
    if (typeof process.env.MAIN_BUCKET === 'undefined')
      throw new Error('Process env is not correctly set up for S3')

    const params: UploadBucketParams = {
      Bucket: process.env.MAIN_BUCKET,
      Key: `${process.env.MAIN_BUCKET}/${filePathName}`,
      Body: buf,
    }

    const upload = createParallelUploads3(params)

    // If called from backend, wait for the result and return
    if (!config?.res) {
      await upload.done()
      return { worked: true, filePathName }
    }

    const newUploadId = uuid()
    Media.uploads.set(newUploadId, { u: upload })

    let client: socket.Socket | undefined = undefined

    // Send partial upload status to frontend
    upload.on('httpUploadProgress', stream => {
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
    config.res.status(200).json({
      success: true,
      uploadId: newUploadId,
    })

    // Wait for upload to finish and then emit finish event to socket, if present
    upload.done().then(async () => {
      if (!config.userId)
        throw new Error(
          'UserID is not present even though direct upload from Frontend was started. Aborting save. Internal Server Error'
        )

      const newId = await Media.save(
        fileName,
        filePathName,
        config.fileType,
        config?.project || '',
        config.userId
      )

      try {
        client?.emit('uploadDone', {
          id: newUploadId,
          mediaId: newId,
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
    res: express.Response<{}, UserRecord>,
    showInBrowser: boolean = false
  ) {
    // TODO: Testing needed One minute for testing, what time to use?
    const cacheExpiration = 1000 * 60
    const streamTags = true

    const media: {
      ID?: number
      filename: string
      URL: string
      uploadedDate: Date
      filetype: string | null
    } = await (
      await new DBService().query(`SELECT * FROM media WHERE URL=? LIMIT 1`, [
        filename.replace(/[^a-z0-9\.\/-]/gi, '_'),
      ])
    ).results

    new Logger().info(
      `Downloading media: ${filename.replace(/[^a-z0-9\.\/-]/gi, '_')}, ID: ${
        media.ID
      }`
    )
    const bucketParams: SearchFileBucketParams = {
      Bucket: process.env.MAIN_BUCKET || 'main',
      Key: `${process.env.MAIN_BUCKET}/${filename.replace(
        /[^a-z0-9\.\/-]/gi,
        '_'
      )}`,
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

      res.setHeader(
        'Content-disposition',
        'inline; filename="' + media.filename + '"'
      )
      const type =
        media.filetype || filename.endsWith('.md')
          ? 'application/markdown'
          : filename.endsWith('.pdf')
          ? 'application/pdf'
          : 'text/plain'

      res.setHeader('Content-type', type)

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
