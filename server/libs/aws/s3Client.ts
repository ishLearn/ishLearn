// Create service client module using ES6 syntax.
import { S3Client } from '@aws-sdk/client-s3'
import Logger from '../../utils/Logger'
import { createBucket } from './commands/manageBucket'
// Set the params like AWS Region, .
const REGION = process?.env?.AWS_REGION || 'eu-central-1' //e.g. "us-east-1"

// Create an Amazon S3 service client object.
const s3Client = new S3Client({
  region: REGION,
  // endpoint: 'http://127.0.0.1:8000',
  endpoint: process.env.S3_ENDPOINT || 'http://localhost:8000',
  credentials: {
    accessKeyId: process.env.MINIO_ROOT_USER || 'accessKey1',
    secretAccessKey: process.env.MINIO_ROOT_PASSWORD || 'verySecretKey1',
  },
})

const initBucket = async () => {
  try {
    await createBucket({ Bucket: process.env.MAIN_BUCKET || 'main' }, false)
    new Logger().event('Init S3', `Main Bucket created`)
  } catch (err: any) {
    if ((err.message as string).includes('Connection Refused')) {
      new Logger().error('Init S3', 'Connection refused by server', err)
      throw new Error(err.message)
    }
    new Logger().event('Init S3', `Main Bucket not created, already exists`)
  }
}

export { s3Client, initBucket }
