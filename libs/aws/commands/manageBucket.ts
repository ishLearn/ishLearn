import Logger from '../../../utils/Logger'

// Get service clients module and commands using ES6 syntax.
import {
  CreateBucketCommand,
  DeleteBucketCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { s3Client } from '../s3Client'

import { listBucketObjects } from './listBucketObjects'

// Import types
import { BucketParams } from '../types'

// Create the Amazon S3 bucket.
export const createBucket = async (bucketParams: BucketParams) => {
  try {
    const data = await s3Client.send(new CreateBucketCommand(bucketParams))
    return data
  } catch (err) {
    new Logger().error(
      'AWS S3 Client',
      `Create Bucket with params: ${JSON.stringify(bucketParams)}`,
      err
    )
  }
}

/** Remove the Amazon S3 bucket.*/
export const deleteBucket = async (
  bucketParams: BucketParams,
  clearBucketParam: boolean
) => {
  if (clearBucketParam) await clearBucket(bucketParams)
  try {
    const data = await s3Client.send(new DeleteBucketCommand(bucketParams))
    return data
  } catch (err) {
    new Logger().error(
      'AWS S3 Client',
      `Create Bucket with params: ${JSON.stringify(bucketParams)}`,
      err
    )
  }
}

export const clearBucket = async (bucketParams: BucketParams) => {
  const items: Array<{ Key: any }> = await listBucketObjects(bucketParams)

  if (typeof items === 'undefined' || !(items.length > 0)) return null

  console.log('Clearing ' + items.length + ' items')
  try {
    const results = await Promise.all(
      items.map(async (item: { Key: any }) => {
        s3Client.send(
          new DeleteObjectCommand({
            Bucket: bucketParams.Bucket,
            Key: item.Key,
          })
        )
      })
    )
    return results
  } catch (err) {
    new Logger().error(
      'AWS S3 Client',
      `Clear Bucket with params: ${JSON.stringify(bucketParams)}`,
      err
    )
  }
}
