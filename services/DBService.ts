import mysql from 'mysql'

/**
 * Service holding the database connection pool. Can be used to query the database or extract connections to perform complex operations on.
 * On initialization, the service will automatically connect to the specified MySQL-DB (see .env) and open a pool of connections to enable parallel DB-operations.
 *
 * @author @SebastianThomas
 */
class DBService {
  /**
   * The singleton instance of this service, holding the pool connection.
   */
  static instance: DBService | null = null

  // Exclamation mark for ensuring this.pool is always set as a pool,
  // otherwise ts-node will complain about the first constructor line
  // leading to a (potential) non-initialization of this.pool
  /**
   * The pool connection to the MySQL-DB
   */
  pool!: mysql.Pool

  /**
   * Create a new DBService if not exists; otherwise returns the singleton instance
   *
   * @see {@link DBService.instance}
   */
  constructor() {
    if (DBService.instance !== null) return DBService.instance

    this.pool = mysql.createPool({
      connectionLimit: 10,
      host: process.env.DB_CONNECTION_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    })

    this.getConnection().then(async connection => {
      try {
        if (await this.ping(connection))
          console.log('Pinged MySQL-DB successfully')
      } catch (err) {
        console.error(`MySQL ping on Pool connection failed!`)
        console.error(err)
      }
    })

    DBService.instance = this
  }

  /**
   * Performs a query against the database with an open pool connection.
   *
   * @param queryString The string to query the DB against
   * @returns a Promise that resolves when the query is executed; returns an object containing results and fields
   */
  query(queryString: string, values: any[]) {
    return new Promise<{ results: any; fields: mysql.FieldInfo[] | undefined }>(
      (resolve, reject) => {
        this.pool.query(queryString, values, (err, results, fields) => {
          if (err) return reject(err)
          return resolve({ results, fields })
        })
      }
    )
  }

  /**
   * Get a connection to the DB to perform an action with.
   *
   * @returns A promise holding a connection to the DB from the pool.
   * @see {@link DBService.query}
   */
  getConnection() {
    return new Promise<mysql.PoolConnection>((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) return reject(err)
        return resolve(connection)
      })
    })
  }

  /**
   * Ping the DB to ensure the connection is established and working correctly.
   *
   * @param connection Connection to use for the ping operation.
   * @returns A promise resolving to true when the ping is successful
   */
  ping(connection: mysql.PoolConnection | mysql.Connection) {
    return new Promise<boolean>((resolve, reject) => {
      connection.ping(err => {
        if (err) return reject(err)
        return resolve(true)
      })
    })
  }
}

export default DBService
