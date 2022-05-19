import Logger from '../../../utils/Logger'

// Get service clients module and commands using ES6 syntax.
import { CreateBucketCommand } from '@aws-sdk/client-s3'
import { s3Client } from '../s3Client'

// Import types
import { CreateBucketParams } from '../types'

// Create the Amazon S3 bucket.
export const createBucket = async (bucketParams: CreateBucketParams) => {
  try {
    const data = await s3Client.send(new CreateBucketCommand(bucketParams))
    console.log('Success', data.Location)
    return data
  } catch (err) {
    new Logger().error(
      'AWS S3 Client',
      `Create Bucket with params: ${JSON.stringify(bucketParams)}`,
      err
    )
  }
}
