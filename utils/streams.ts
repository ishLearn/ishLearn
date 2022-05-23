/**
 * Helper function to convert a ReadableStream to a string.
 */
export const streamToString = (
  stream: NodeJS.ReadableStream | any
): Promise<string> =>
  new Promise((resolve, reject) => {
    const chunks: any[] = []
    stream.on('data', (chunk: any) => chunks.push(chunk))
    stream.on('error', reject)
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
  })
