import fs from 'fs'
import path from 'path'

import Logger from '../../../utils/Logger'

// Import required AWS SDK clients and commands for Node.js.
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { s3Client } from '../s3Client' // Helper function that creates an Amazon S3 service client module.

// Import types
import { UploadBucketParams, UploadFileBucketParams } from '../types'

export const uploadContent = async (bucketParams: UploadBucketParams) => {
  try {
    const data = await s3Client.send(new PutObjectCommand(bucketParams))
    console.log(
      'Successfully uploaded object: ' +
        bucketParams.Bucket +
        '/' +
        bucketParams.Key
    )
    return data // For unit tests.
  } catch (err) {
    new Logger().error(
      'AWS S3 Client',
      `Upload file with Bucket params: ${JSON.stringify(bucketParams)}`,
      err
    )
  }
}

// Create and upload the object to the S3 bucket.
export const uploadFile = async (bucketParams: UploadFileBucketParams) => {
  const fileStream = fs.createReadStream(bucketParams.FilePath)

  const bParams: UploadBucketParams = { ...bucketParams, Body: fileStream }
  // delete bParams.FilePath

  try {
    const data = await s3Client.send(new PutObjectCommand(bParams))
    console.log(
      'Successfully uploaded object: ' + bParams.Bucket + '/' + bParams.Key
    )
    return data // For unit tests.
  } catch (err) {
    new Logger().error(
      'AWS S3 Client',
      `Upload file with Bucket params: ${JSON.stringify(bParams)}`,
      err
    )
  }
}
