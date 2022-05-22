import { Upload } from '@aws-sdk/lib-storage'
import { s3Client } from './s3Client'

import { UploadBucketParams } from './types'

export const createParallelUploads3 = (bucketParams: UploadBucketParams) =>
  new Upload({
    client: s3Client,
    params: bucketParams,
    tags: [],
    queueSize: 4,
    partSize: 1024 * 1024 * 5, // 1024 * (1024 * 5B = 5KB) = 5MB = minimum part size
    leavePartsOnError: false,
  })
