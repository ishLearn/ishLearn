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
          console.log('Pinged MySQL-DB with new DBService successfully')
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
  query(queryString: string, values?: any[]) {
    return new Promise<{ results: any; fields: mysql.FieldInfo[] | undefined }>(
      (resolve, reject) => {
        this.pool.query(queryString, values || [], (err, results, fields) => {
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

  /**
   * Creates a table in the database with a connection from pool.
   * @param tableName Table to create
   * @param columns Columns for the table.
   * @returns The MySQL-db return
   */
  createTable(tableName: string, columns: Column[]) {
    return this.query(
      `CREATE TABLE IF NOT EXISTS ${tableName} (${columns
        .map(c => columnToString(c))
        .join(', ')});`
    )
  }

  insertInto(tableName: string, columnNames: Column[], values: any[]) {
    return this.query(
      `INSERT INTO ${tableName} (${columnNames
        .map(c => columnToString(c))
        .join(', ')}) VALUES ?;`,
      values
    )
  }
}

export type Column = {
  name: string
  type?: string
}

export function columnToString(c: Column): string {
  return `${c.name} ${c.type || ''}`.trim()
}

export const enums = {
  visibilities: ['private', 'schoolPrivate', 'link', 'public'],
  categories: ['school', 'gradeLevel', 'mediaType', 'subject'], // TODO: What categories should be allowed?
  supervisedByStatus: ['submissionOpen', 'submissionClosed', 'graded'], // TODO: What status should be allowed?
}

export const dbQueries = {
  exportTableQueries: {
    products: `CREATE TABLE IF NOT EXISTS products (ID VARCHAR(16) PRIMARY KEY, title VARCHAR(255) NOT NULL, visibility ENUM(${enums.visibilities.join(
      ', '
    )}) NOT NULL, createDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updatedDate Timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, updatedBy VARCHAR(16) FOREIGN KEY (title) REFERENCES users(ID));`,
    media: `CREATE TABLE IF NOT EXISTS media (ID VARCHAR(16) PRIMARY KEY, filename VARCHAR(255) NOT NULL, URL VARCHAR(255) NOT NULL), uploadedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP, product VARCHAR(16) FOREIGN KEY REFERENCES products(ID);`,
    users: `CREATE TABLE IF NOT EXISTS users (ID VARCHAR(16) PRIMARY KEY, email VARCHAR(255) NOT NULL (TODO: UNIQUE OR KEY?), emailTmp VARCHAR(255), password: VARCHAR(255) NOT NULL), firstName VARCHAR(255) NOT NULL, lastName VARCHAR(255) NOT NULL, birthday Date NOT NULL, profilePicture VARCHAR(255) FOREIGN KEY REFERENCES !!!!, profileText VARCHAR(255) FOREIGN KEY REFERENCES !!!!;`, // TODO: What references
    tags: `CREATE TABLE IF NOT EXISTS tags (tag VARCHAR(255) PRIMARY KEY);`,
    hasTag: `CREATE TABLE IF NOT EXISTS hasTag (tag VARCHAR(255) NOT NULL FOREIGN KEY REFERENCES tags(tag), ID FOREIGN KEY REFERENCES !!!!, PRIMARY KEY (tag, ID));`,
    categories: `CREATE TABLE IF NOT EXISTS categories (tag VARCHAR(255) NOT NULL PRIMARY KEY FOREIGN KEY REFERENCES tags(tag), category ENUM(${enums.categories.join(
      ', '
    )}) NOT NULL)`,
    supervisedBy: `CREATE TABLE IF NOT EXISTS supervisedBy (PID VARCHAR(16) FOREIGN KEY REFERENCES products(ID), TID VARCHAR(16) FOREIGN KEY REFERENCES users(ID), status ENUM(${enums.supervisedByStatus.join(
      ', '
    )}) NOT NULL, grade VARCHAR(255)), PRIMARY KEY (PID, TID)`,
    uploadBy: `CREATE TABLE IF NOT EXISTS uploadBy (PID VARCHAR(16) FOREIGN KEY REFERENCES products(ID), SID VARCHAR(16) FOREIGN KEY REFERENCES users(ID), PRIMARY KEY (PID, SID))`,
    // TODO: Missing (remark / star project, comment)
    // TODO: Decide whether corrections should only be added to
  },
}

export default DBService
