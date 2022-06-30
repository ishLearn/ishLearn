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
export const createBucket = async (
  bucketParams: BucketParams,
  log: boolean = true
) => {
  try {
    const data = await s3Client.send(new CreateBucketCommand(bucketParams))
    return data
  } catch (err: any) {
    if (log)
      new Logger().error(
        'AWS S3 Client',
        `CREATE Bucket with params: ${JSON.stringify(bucketParams)}`,
        err
      )
    if ((err.message as string).includes('ECONNREFUSED'))
      throw new Error('S3 Client: Connection Refused')
    throw new Error('Could not create bucket.')
  }
}

/** Remove the Amazon S3 bucket.*/
export const deleteBucket = async (
  bucketParams: BucketParams,
  clearBucketParam: boolean,
  expectPresent: boolean = true
) => {
  try {
    if (clearBucketParam) await clearBucket(bucketParams, expectPresent)
    const data = await s3Client.send(new DeleteBucketCommand(bucketParams))
    return data
  } catch (err) {
    if (expectPresent) {
      new Logger().error(
        'AWS S3 Client',
        `DELETE Bucket with params: ${JSON.stringify(bucketParams)}`,
        err
      )
      throw new Error('Could not delete bucket.')
    } else throw new Error('Bucket does not appear to exist, so not deleted.')
  }
}

export const clearBucket = async (
  bucketParams: BucketParams,
  expectPresent: boolean = true
) => {
  try {
    const items: Array<{ Key: any }> = await listBucketObjects(
      bucketParams,
      expectPresent
    )

    if (typeof items === 'undefined' || !(items.length > 0)) return null

    new Logger().event('Clear S3 bucket', 'Clearing ' + items.length + ' items')
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
    if (expectPresent) {
      new Logger().error(
        'AWS S3 Client',
        `CLEAR Bucket with params: ${JSON.stringify(bucketParams)}`,
        err
      )
      throw new Error('Could not clear bucket.')
    } else throw new Error('Bucket does not appear to exist, so not cleared.')
  }
}
