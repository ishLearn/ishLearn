import fs from 'fs'
import path from 'path'

// Import types
import { UploadBucketParams, UploadFileBucketParams } from '../types'

export const getUploadFileBParams = (
  bucketParams: UploadFileBucketParams
): UploadBucketParams => {
  if (typeof bucketParams.FilePath === 'undefined')
    throw new Error('Missing File Path in Upload File')
  const fileStream = fs.createReadStream(
    path.join(__dirname, '../../..', bucketParams.FilePath)
  )

  delete bucketParams.FilePath
  return {
    ...bucketParams,
    Body: fileStream,
  }
}
