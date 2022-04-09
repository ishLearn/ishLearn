// Import types
import express, { Request, Response, NextFunction } from 'express'

// Import logic modules
import chalk from 'chalk'

import { formatDate, formatTime } from './formatting'

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
  request(req: Request, _res: Response, next: NextFunction) {
    const now = new Date()
    console.log(
      chalk.blue(formatDate('/', now) + ' ' + formatTime(':', now) + ': ') +
        chalk.red(req.method) +
        ' ' +
        chalk.green(req.path)
    )

    next()
  }

  /**
   * Logs the server's listening status to the console in bright green.
   *
   * @param {number | string} PORT Port the server is listening on
   */
  listen(PORT: number | string) {
    console.log(chalk.greenBright(`Listening to PORT ${PORT}`))
  }
}
