import { Upload } from '@aws-sdk/lib-storage'
import express from 'express'
import { v4 as uuid } from 'uuid'

import socket from 'socket.io'

import { UploadBucketParams } from '../libs/aws/types'
import { createParallelUploads3 } from '../libs/aws/upload'
import Logger from '../utils/Logger'

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
}
