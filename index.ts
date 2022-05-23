import express from 'express'

import dotenv from 'dotenv'
dotenv.config()

// Import api routes
import users from './routes/users'

// Initialize logger
import Logger from './utils/Logger'
/**
 * Global Logger for logging to console
 */
const logger = new Logger()
// Initialize DBService (start DB connection pool)
import DBService from './services/DBService'
import { exec } from 'child_process'
/**
 * Global Service for DB connections
 */
const dbService = new DBService()

// Express server and middleware:
// Initialize Express server
const app = express()

// Middleware: parse incoming json from HTTP-request body
app.use(express.json())
// Middleware: Log all requests
app.use(logger.request)

app.use('/api/users', users)

// Initial API-route
app.get('/api', (_req, res) => {
  res.status(200).json({ message: 'OK, but nothing to do here.' })
})

// Bind server to port
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  logger.listen(PORT)
})

exec('ffmpeg -version', (err, _stdout, _stderr) => {
  if (err) {
    logger.error(
      'FFMpeg',
      'Test FFMpeg',
      'Please install FFMpeg on your system!'
    )
    throw err
  }
})

import { listAll } from './libs/aws/commands/listBuckets'
import { uploadFile, uploadContent } from './libs/aws/commands/uploadFile'
import { createBucket } from './libs/aws/commands/createBucket'
;(async () => {
  await listAll()
  // console.log(await createBucket({ Bucket: 'test' }))
  // console.log(
  //   await uploadFile({
  //     Bucket: 'test',
  //     Key: 'test.txt',
  //     FilePath: 'testsFolder/test.txt',
  //   })
  // )
  // await listAll()
  // console.log(
  //   await uploadContent({
  //     Bucket: 'test',
  //     Key: 'test2.txt',
  //     Body: 'This is a test',
  //   })
  // )
})()
