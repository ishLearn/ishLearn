// Create service client module using ES6 syntax.
import { S3Client } from '@aws-sdk/client-s3'
// Set the params like AWS Region, .
const REGION = process?.env?.AWS_REGION || 'eu-central-1' //e.g. "us-east-1"

// Create an Amazon S3 service client object.
const s3Client = new S3Client({
  region: REGION,
  // endpoint: 'http://127.0.0.1:8000',
  endpoint: process.env.S3_ENDPOINT || 'http://localhost:8000',
  credentials: {
    accessKeyId: process.env.SCALITY_ACCESS_KEY_ID || 'accessKey1',
    secretAccessKey: process.env.SCALITY_SECRET_ACCESS_KEY || 'verySecretKey1',
  },
})

export { s3Client }
