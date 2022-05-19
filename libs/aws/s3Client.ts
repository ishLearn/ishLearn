// Create service client module using ES6 syntax.
import { S3Client } from '@aws-sdk/client-s3'
// Set the params like AWS Region, .
const REGION = process?.env.AWS_REGION || 'eu-central-1' //e.g. "us-east-1"

// Create an Amazon S3 service client object.
const s3Client = new S3Client({
  region: REGION,
  endpoint: 'http://127.0.0.1:8000',
  credentials: {
    accessKeyId: 'accessKey1',
    secretAccessKey: 'verySecretKey1',
  },
})
export { s3Client }
