// Import server modules
import express from 'express'
import http from 'http'
import { Server as SocketIOServer } from 'socket.io'

// Config dotenv
import dotenv from 'dotenv'
dotenv.config()

// Import socket.io handler
import { socketIOConnectionHandler } from './socketio/socketIOConnectionHandler'

// Initialize logger
import Logger from './utils/Logger'
/**
 * Global Logger for logging to console
 */
const logger = new Logger()
// Initialize DBService (start DB connection pool) and Redis Server
import DBService from './services/DBService'
import { initBucket, s3Client } from './libs/aws/s3Client'
import { connectRedisClient as startRedis } from './services/RedisService'

import { exec } from 'child_process'

// Import api routes
import users from './routes/users'
import auth from './routes/auth'
import products from './routes/products'
import callback from './routes/callback'
import tags from './routes/tags'
import categories from './routes/categories'
import uploads from './routes/files/uploads'
import downloads from './routes/files/downloads'
// Import middleware
import { authMiddleware } from './middleware/authMiddleware'

/**
 * Global Service for DB connections
 */
new DBService()
initBucket()
startRedis()

// Express server and middleware:
// Initialize Express and socket.io server with NodeJS HTTP module
const app = express()
const server = http.createServer(app)
const io = new SocketIOServer(server)

// Middleware: parse incoming json from HTTP-request body
app.use(express.json())
// Use custom Authentication middleware
app.use(authMiddleware)
// Middleware: Log all requests
app.use(logger.request)

// Disable X-Powered-By Header
app.set('x-powered-by', false)

app.use((_req, res, next) => {
  res.header('x-powered-by', 'sthomas.ch')
  next()
})

// Use routes
app.use('/api/users', users)
app.use('/api/auth', auth)
app.use('/api/callback', callback)
app.use('/api/products', products)
app.use('/api/tags', tags)
app.use('/api/categories', categories)
app.use('/api/files/upload', uploads)
app.use('/api/files/download', downloads)

// Init socket.io connection
io.on('connection', socketIOConnectionHandler)

// Handle production builds
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(__dirname + '/frontend-dist/'))

  // Handle Single Page Application
  app.get(/.*/, (req, res) =>
    res.sendFile(__dirname + '/frontend-dist/index.html')
  )
}

// Bind HTTP server to port (the one created with express and socket.io)
const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  logger.listen(PORT, process.env.NODE_ENV || 'development')
})

// Test if `ffmpeg` cli is installed on the system
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
