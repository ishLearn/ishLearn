import Logger from '../../../utils/Logger'

// Import required AWS SDK clients and commands for Node.js.
import {
  ListBucketsCommand,
  ListBucketsCommandOutput,
} from '@aws-sdk/client-s3'
import { s3Client } from '../s3Client' // Helper function that creates an Amazon S3 service client module.

export const listAllBuckets = async (): Promise<ListBucketsCommandOutput> => {
  try {
    const data = await s3Client.send(new ListBucketsCommand({}))
    return data
  } catch (err) {
    new Logger().error('AWS S3 Client', 'List All Buckets', err)
  }
  throw new Error(
    'Could not list all buckets; refer to previous log for further error log.'
  )
}
