import { createBucket, deleteBucket } from '../libs/aws/commands/manageBucket'
import { BucketParams } from '../libs/aws/types'

import Logger from '../utils/Logger'

const buckets: string[] = ['projects']

export const setupResetS3 = async () => {
  try {
    await Promise.all(
      buckets
        .map((bucketName: string): BucketParams => ({ Bucket: bucketName }))
        .map(async (bucket: BucketParams) => {
          return await deleteBucket(bucket, true, false)
        })
    )
  } catch (err) {
    console.log('S3 Buckets not found; so nothing to reset')
  }
  new Logger().s3setup('Removed following S3 bucket(s): ' + buckets.join(', '))

  return await Promise.all(
    buckets
      .map((bucketName: string): BucketParams => ({ Bucket: bucketName }))
      .map(async (bucket: BucketParams) => {
        const result = await createBucket(bucket)
        new Logger().s3setup(
          'Added following S3 bucket(s): ' + buckets.join(', ')
        )
        return result
      })
  )
}
;(async () => {
  await setupResetS3()
})()
