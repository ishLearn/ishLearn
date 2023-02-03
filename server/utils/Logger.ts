// Import types
import express, { Request, Response, NextFunction } from 'express'

// Import logic modules
import chalk from 'chalk'

import { formatDate, formatTime } from './formatting'
import { Socket } from 'socket.io'

import { UserRecord } from '../types/users'

/**
 * @author @SebastianThomas
 */
export default class Logger {
  /**
   * The singleton instance of the logger.
   */
  static instance: Logger | null = null

  /**
   * Create a new logger instance or return the singleton instance.
   * @see {@link Logger.instance}
   */
  constructor() {
    if (Logger.instance !== null) return Logger.instance

    console.log(chalk.yellow('Started logging (with chalk)'))

    Logger.instance = this
  }

  /**
   * Log a new request to the console and calls the next middleware handler.
   *
   * @param req The request object to get information from.
   * @param _res The response object (unused)
   * @param {NextFunction} next The next middleware-function to be called after logging
   */
  request(req: Request, res: Response<{}, UserRecord>, next: NextFunction) {
    if (!req.path.startsWith('/api') && !(req.path == '/')) return next()

    const now = new Date()
    let str =
      chalk.blue(formatDate('/', now) + ' ' + formatTime(':', now) + ': ') +
      chalk.red(req.method) +
      '\t' +
      chalk.green(req.path)
    if (res.locals.user?.id) str += '; LoggedIn: ' + res.locals.user?.id
    else
      str += `; ${
        req.headers['x-forwarded-for'] || req.headers['X-Forwarded-For']
      }, Real_IP: ${req.headers['X-Real-IP'] || req.ip}`
    console.log(str)

    next()
  }

  newSocketConnection(socket: Socket): void {
    console.log(
      chalk.bgBlueBright(`New client socket connected:`) + chalk.red(socket.id)
    )
  }

  socketDisconnect(socket: Socket): void {
    console.log(
      chalk.bgBlueBright(`Client socket disconnected:`) + chalk.red(socket.id)
    )
  }

  /**
   * Log an successful event to the console.
   * @param category The part of the code that finished
   * @param task The specific task that successfully finished
   * @param directInfo Potential direct output from variable, not formatted
   */
  event(category: string, task: string, directInfo?: any) {
    console.log(
      chalk.bgBlueBright(`SUCCESS:`) +
        ' ' +
        chalk.red(task) +
        ': ' +
        chalk.blue(category) +
        (typeof directInfo !== 'undefined' ? ' \n' + directInfo : '')
    )
  }

  /**
   * Log an information to the console.
   * @param info The information
   */
  info(info: string) {
    console.log(chalk.cyanBright(info))
  }

  /**
   * Log an error to the console.
   * TODO: _for later_ Send information to another server / log to a file to preserve stack trace?
   * @param category The part of the code where the error occurred (e.g., "Hashing password", "Handling request")
   * @param task The specific task that failed
   * @param error The original error log
   */
  error(category: string, task: string, error: any) {
    console.log(
      chalk.bgRed(`ERROR:`) +
        ' ' +
        chalk.red(task) +
        ': ' +
        chalk.blue(category) +
        ' \n' +
        error
    )
  }

  /**
   * Log an S3 setup event to the console.
   * @param task The specific task that was successfully executed
   */
  s3setup(task: string) {
    console.log(chalk.bgBlue(`S3 Setup:`) + ' ' + chalk.blue(task))
  }

  /**
   * Logs the server's listening status to the console in bright green.
   *
   * @param {number | string} PORT Port the server is listening on
   * @param {string} NODE_ENV Node environment
   */
  listen(PORT: number | string, NODE_ENV: string) {
    console.log(
      chalk.greenBright(`Listening to PORT ${PORT}, in ENV: ${NODE_ENV}`)
    )
  }
}
