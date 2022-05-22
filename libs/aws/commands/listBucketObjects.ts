import Logger from '../../../utils/Logger'

// Get service clients module and commands using ES6 syntax.
import {
  ListObjectsCommand,
  ListObjectsCommandInput,
  ListObjectsV2CommandOutput,
  paginateListObjectsV2,
  _Object,
} from '@aws-sdk/client-s3'
import { s3Client } from '../s3Client'

// Import types
import { BucketParams } from '../types'

const hasKeyProperty = (o: _Object): o is { Key: any } => {
  return typeof o.Key !== 'undefined'
}

export const listBucketObjects = async (
  bucketParams: ListObjectsCommandInput
): Promise<{ Key: any }[]> => {
  const result: { Key: any }[] = []

  // Declare truncated as a flag that the while loop is based on.
  let truncated = true
  // Declare a variable to which the key of the last element is assigned to in the response.
  let pageMarker
  // while loop that runs until 'response.truncated' is false.
  while (truncated) {
    try {
      const response = await s3Client.send(new ListObjectsCommand(bucketParams))
      if (typeof response.Contents === 'undefined') return []

      // Accept all results that do have Keys
      result.push(...response.Contents.filter(hasKeyProperty))

      // If truncated is true, assign the key of the last element in the response to the pageMarker variable.
      truncated = response.IsTruncated || false
      if (truncated) {
        pageMarker = response.Contents.slice(-1)[0].Key
        // Assign the pageMarker value to bucketParams so that the next iteration starts from the new pageMarker.
        bucketParams.Marker = pageMarker
      }
    } catch (err) {
      new Logger().error(
        'AWS S3 Client',
        `Listing Bucket Objects by Page Marker with params: ${JSON.stringify(
          bucketParams
        )}`,
        err
      )
      truncated = false
    }
  }
  // At end of the list, response.truncated is false
  return result
}

// Create the Amazon S3 bucket.
export const listBucketObjectsPagination = async (
  bucketParams: BucketParams
): Promise<{ Key: any }[]> => {
  try {
    const totalFiles: Array<{ Key: any }> = []
    for await (const data of paginateListObjectsV2(
      { client: s3Client },
      bucketParams
    )) {
      const newFiles: Array<{ Key?: any }> = data.Contents ?? []
      const newFilesWithKey: Array<{ Key: any }> =
        newFiles.filter(hasKeyProperty)
      totalFiles.push(...newFilesWithKey)
    }
    return totalFiles

    // Old code for retrieving objects; only lists the first 1000 items (therefore, the code above uses the pagination function)
    // const data = await s3Client.send(new ListObjectsCommand(bucketParams))
    // console.log('Success', data)
    // return data
  } catch (err) {
    new Logger().error(
      'AWS S3 Client',
      `Listing Bucket Objects by pagination with params: ${JSON.stringify(
        bucketParams
      )}`,
      err
    )
    return []
  }
}
