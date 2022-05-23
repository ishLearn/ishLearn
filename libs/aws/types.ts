import fs from 'fs'

/**
 * Name of the Bucket.
 */
export type BucketName = string
/**
 * Content of the new object.
 */
export type BucketBody = string | fs.ReadStream
/**
 * Content of the new object.
 */
export type BucketFilePath = string
/**
 * Specify the name of the new object (file). For example, 'index.html'.
 * To create a directory for the object (file), use '/'. For example, 'myApp/package.json'.
 */
export type BucketKey = string

/**
 * All Parameters for Bucket methods.
 */
export type BucketParams = {
  Bucket: BucketName
  Key?: BucketKey
  Body?: BucketBody
}

/**
 * Parameters for Bucket creation.
 */
export type CreateBucketParams = { Bucket: BucketName }

/**
 * Parameters for content upload.
 */
export type UploadBucketParams = {
  Bucket: BucketName
  Key: BucketKey
  Body: BucketBody
}
/**
 * Parameters for file upload.
 */
export type UploadFileBucketParams = {
  Bucket: BucketName
  Key: BucketKey
  FilePath?: BucketFilePath
}

/**
 * Parameters for file search.
 */
export type SearchFileBucketParams = {
  Bucket: BucketName
  Key: BucketKey
}
