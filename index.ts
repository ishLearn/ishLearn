// Import server modules
import express from 'express'
import http from 'http'
import { Server as SocketIOServer } from 'socket.io'

// Config dotenv
import dotenv from 'dotenv'
dotenv.config()

// Import socket.io handler
import { socketIOConnectionHandler } from './socketio/socketIOConnectionHandler'

// Import api routes
import users from './routes/users'
import products from './routes/products'
import uploads from './routes/files/uploads'
import downloads from './routes/files/downloads'
// Import middleware
import authMiddleware from './middleware/authMiddleware'

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
new DBService()

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

// Use routes
app.use('/api/users', users)
app.use('/api/products', products)
app.use('/api/files/upload', uploads)
app.use('/api/files/download', downloads)

// Init socket.io connection
io.on('connection', socketIOConnectionHandler)

// Bind HTTP server to port (the one created with express and socket.io)
const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  logger.listen(PORT)
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
