import Logger from '../../../utils/Logger'

// Import required AWS SDK clients and commands for Node.js.
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { s3Client } from '../s3Client' // Helper function that creates an Amazon S3 service client module.

import { streamToString } from '../../../utils/streams'

import { SearchFileBucketParams } from '../types'

export const getFile = async (bucketParams: SearchFileBucketParams) => {
  try {
    // Get the object} from the Amazon S3 bucket. It is returned as a ReadableStream.
    const data = await s3Client.send(new GetObjectCommand(bucketParams))
    console.log(data)
    // Convert the ReadableStream to a string.
    if (typeof data?.Body !== 'undefined') {
      const bodyContents = await streamToString(data.Body)
      console.log(bodyContents)
      return bodyContents
    } else throw new Error('Object (file) could not be retrieved.')
  } catch (err) {
    new Logger().error(
      'AWS S3 Client',
      `Retrieve file with Bucket params: ${JSON.stringify(bucketParams)}`,
      err
    )
  }
}
