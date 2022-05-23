import Logger from '../../../utils/Logger'

// Import required AWS SDK clients and commands for Node.js.
import { ListBucketsCommand } from '@aws-sdk/client-s3'
import { s3Client } from '../s3Client' // Helper function that creates an Amazon S3 service client module.

export const listAll = async () => {
  try {
    const data = await s3Client.send(new ListBucketsCommand({}))
    console.log('Success', data.Buckets)
    return data // For unit tests.
  } catch (err) {
    new Logger().error('AWS S3 Client', 'List All Buckets', err)
  }
}
