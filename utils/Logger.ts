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
   * Log an error to the console.
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
        ' \n' +
        directInfo
    )
  }

  /**
   * Log an error to the console.
   * TODO: Send information to another server / log to a file to preserve stack trace?
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
   * Logs the server's listening status to the console in bright green.
   *
   * @param {number | string} PORT Port the server is listening on
   */
  listen(PORT: number | string) {
    console.log(chalk.greenBright(`Listening to PORT ${PORT}`))
  }
}
