import dotenv from 'dotenv'
dotenv.config()
console.log(process.env.SCALITY_ACCESS_KEY_ID)
console.log(process.env.SCALITY_SECRET_ACCESS_KEY)

// Time import
import { wait } from '../utils/dev/time'

// AWS libs imports
import { createParallelUploads3 } from '../libs/aws/upload'
import { listAllBuckets } from '../libs/aws/commands/listBuckets'
import { getUploadFileBParams } from '../libs/aws/commands/uploadFile'
import {
  clearBucket,
  createBucket,
  deleteBucket,
} from '../libs/aws/commands/manageBucket'
import { getFile } from '../libs/aws/commands/getFile'
import { listBucketObjects } from '../libs/aws/commands/listBucketObjects'

/*
test('Test Bucket Creation', async () => {
  await createBucket({ Bucket: 'test2' })
})

test('Test Bucket Deletion', async () => {
  await expect(deleteBucket({ Bucket: 'test2' }, false)).resolves.toBeDefined()
})

test('List Bucket Objects', async () => {
  await createParallelUploads3(
    getUploadFileBParams({
      FilePath: 'testsFolder/test.txt',
      Key: 'test.txt',
      Bucket: 'test',
    })
  ).done()
  const res = (await listBucketObjects({ Bucket: 'test' })).map(k => k.Key)
  expect(res).toContainEqual('test.txt')
})

test('upload to test bucket', async () => {
  const name = `${Date.now().toString()}-test.txt`
  const s = createParallelUploads3(
    getUploadFileBParams({
      FilePath: 'testsFolder/test.txt',
      Key: name,
      Bucket: 'test',
    })
  )
  s.on('httpUploadProgress', progress => {
    // console.log(progress)
  })
  await s.done()
  const file = await getFile({
    Bucket: 'test',
    Key: name,
  })
  expect(file).toBe('TestTextForS3')
})
*/

if (typeof process.env.TEST_BUCKET === 'undefined') {
  throw new Error('Cannot start test, no test bucket name defined')
}

// Setup
const testBucketName = process.env.TEST_BUCKET
const salt = new Date().getTime()
const Bucket = testBucketName + salt

jest.setTimeout(15000)
test('Complete test bucket', async () => {
  // Create bucket
  await createBucket({ Bucket })

  // Upload new Test file
  await createParallelUploads3(
    getUploadFileBParams({
      FilePath: 'testsFolder/test.txt',
      Key: 'test.txt',
      Bucket,
    })
  ).done()
  const resKeysWithTest = (await listBucketObjects({ Bucket })).map(k => k.Key)
  expect(resKeysWithTest).toContainEqual('test.txt')

  // Clear Bucket (Remove file)
  await clearBucket({ Bucket })

  wait(1000)
  const res = await listBucketObjects({ Bucket })
  expect(res).toEqual([])

  // Remove Bucket & Test bucket not existing
  await expect(deleteBucket({ Bucket }, false)).resolves.toBeDefined()

  const s = await listAllBuckets()
  expect(s.Buckets?.map(c => ({ Name: c.Name }))).not.toContainEqual({
    Name: Bucket,
  })
})
