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
app.get('/api', (req, res) => {
  res.status(200).json({ message: 'OK, but nothing to do here.' })
})

// Bind server to port
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  logger.listen(PORT)
})
