import mysql from 'mysql'
import Hashids from 'hashids'
import { NumberLike } from 'hashids/cjs/util'
import Logger from '../utils/Logger'

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
  static hashids = new Hashids(process.env.ID_HASH_SALT || 'enoN', 8)

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
          new Logger().event(
            'DB Connection',
            'Pinged MySQL-DB',
            `${process.env.DB_USER}@${process.env.DB_CONNECTION_HOST}`
          )
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

// ---------------------------------- IDs ----------------------------------
// Documentation to ids: https://www.npmjs.com/package/hashids
/**
 * Converts number ID to string.
 * @param intID The integer number to encode
 * @returns The string hash
 */
export const getHashFromIntID = (intID: number | NumberLike) => {
  const result = DBService.hashids.encode(intID)
  if (result === '') throw new Error('Invalid input')
  return result
}
/**
 * Parse a string hash from an ID (to a string)
 * @param hash The string hash to decode
 * @returns The decoded number
 */
export const getIntIDFromHash = (hash: string) => {
  const result = DBService.hashids.decode(hash)
  if (typeof result[0] === undefined || result[0] < 0)
    throw new Error('Invalid input')
  return result[0]
}

// ---------------------------------- COLUMN ----------------------------------
/**
 * Column represents a column name and its associated type.
 */
export type Column = {
  name: string
  type?: string
}

/**
 * Converts a column into a string
 * @param c A column with name and potentially type, otherwise type is ignored
 */
export function columnToString(c: Column): string {
  return `${c.name} ${c.type || ''}`.trim()
}

// ---------------------------------- ENUMS ----------------------------------
/**
 * Project Visibilities
 */
export enum Visibility {
  PRIVATE = 'private',
  SCHOOL_PRIVATE = 'schoolPrivate',
  LINK = 'link',
  PUBLIC = 'public',
}
/**
 * @return An array of all Visibilities
 */
export function getVisibilities() {
  return Object.entries(Visibility).map(v => v[1])
}

/**
 * The categories a tag can be part of
 */
enum Category {
  SCHOOL = 'school',
  GRADE_LEVEL = 'classLevel',
  MEDIA_TYPE = 'mediaType',
  SUBJECT = 'subject',
}
/**
 * @return An array of all tag categories
 */
export function getCategories() {
  return Object.entries(Category).map(v => v[1])
}

/**
 * Status of a Project
 */
export enum SupervisedByStatus {
  SUBMISSION_OPEN = 'submissionOpen',
  SUBMISSION_CLOSED = 'submissionClosed',
  GRADED = 'graded',
}
/**
 * @return An array of all supervised_by_status
 */
export function getSupervisedByStatus() {
  return Object.entries(SupervisedByStatus).map(v => v[1])
}

/**
 * Status of a Project
 */
enum UserRank {
  ADMIN = 'admin',
  STUDENT = 'student',
  TEACHER = 'teacher',
}
/**
 * @return An array of all user_ranks
 */
export function getUserRanks() {
  return Object.entries(UserRank).map(v => v[1])
}

/**
 * All queries that can be executed against the DB.
 */
export const dbQueries = {
  /**
   * All CREATE TABLE queries for the DB
   */
  exportTableQueries: {
    media: `CREATE TABLE IF NOT EXISTS media (ID INT(255) UNSIGNED AUTO_INCREMENT PRIMARY KEY NOT NULL, filename VARCHAR(255) NOT NULL, URL VARCHAR(255) NOT NULL, uploadedDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP);`,
    users: `CREATE TABLE IF NOT EXISTS users (ID INT(255) UNSIGNED AUTO_INCREMENT PRIMARY KEY NOT NULL, email VARCHAR(255) NOT NULL UNIQUE, rank ENUM(\"${getUserRanks().join(
      '", "'
    )}\") NOT NULL, emailTmp VARCHAR(255), password VARCHAR(255) NOT NULL, firstName VARCHAR(255) NOT NULL, lastName VARCHAR(255) NOT NULL, birthday Date, profilePicture INT(255) UNSIGNED DEFAULT NULL, profileText INT(255) UNSIGNED DEFAULT NULL, FOREIGN KEY (profilePicture) REFERENCES media(ID) ON UPDATE SET NULL ON DELETE SET NULL, FOREIGN KEY (profileText) REFERENCES media(ID) ON UPDATE SET NULL ON DELETE SET NULL);`,

    products: `CREATE TABLE IF NOT EXISTS products (ID INT(255) UNSIGNED AUTO_INCREMENT PRIMARY KEY NOT NULL, title VARCHAR(255) NOT NULL, visibility ENUM(\"${getVisibilities().join(
      '", "'
    )}\") NOT NULL, createDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updatedDate Timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, createdBy INT(255) UNSIGNED NOT NULL REFERENCES users(ID), updatedBy INT(255) UNSIGNED NOT NULL REFERENCES users(ID));`,

    mediaPartOfProduct: `CREATE TABLE IF NOT EXISTS mediaPartOfProduct (MID INT(255) UNSIGNED REFERENCES media(ID), PID INT(255) UNSIGNED REFERENCES products(ID));`,

    tags: `CREATE TABLE IF NOT EXISTS tags (tag VARCHAR(255) NOT NULL PRIMARY KEY);`,
    productHasTag: `CREATE TABLE IF NOT EXISTS productHasTag (tag VARCHAR(255) NOT NULL REFERENCES tags(tag), PID INT(255) UNSIGNED REFERENCES products(ID), PRIMARY KEY (tag, PID));`,
    mediaHasTag: `CREATE TABLE IF NOT EXISTS mediaHasTag (tag VARCHAR(255) NOT NULL REFERENCES tags(tag), MID INT(255) UNSIGNED REFERENCES media(ID), PRIMARY KEY (tag, MID));`,
    userHasTag: `CREATE TABLE IF NOT EXISTS userHasTag (tag VARCHAR(255) NOT NULL REFERENCES tags(tag), UID INT(255) UNSIGNED REFERENCES users(ID), PRIMARY KEY (tag, UID));`,

    categories: `CREATE TABLE IF NOT EXISTS categories (tag VARCHAR(255) NOT NULL PRIMARY KEY REFERENCES tags(tag), category ENUM(\"${getCategories().join(
      '", "'
    )}\") NOT NULL)`,

    supervisedBy: `CREATE TABLE IF NOT EXISTS supervisedBy (PID INT(255) UNSIGNED NOT NULL REFERENCES products(ID), TID INT(255) UNSIGNED NOT NULL REFERENCES users(ID), status ENUM(\"${getSupervisedByStatus().join(
      '", "'
    )}\") NOT NULL, grade VARCHAR(255), PRIMARY KEY (PID, TID))`,
    uploadBy: `CREATE TABLE IF NOT EXISTS uploadBy (PID INT(255) UNSIGNED NOT NULL REFERENCES products(ID), UID INT(255) UNSIGNED NOT NULL REFERENCES users(ID), PRIMARY KEY (PID, UID))`,
    rememberProject: `CREATE TABLE IF NOT EXISTS rememberProject (PID INT(255) UNSIGNED NOT NULL REFERENCES products(ID), SID INT(255) UNSIGNED NOT NULL REFERENCES users(ID), addedTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (PID, SID))`,
    comments: `CREATE TABLE IF NOT EXISTS comments (PID INT(255) UNSIGNED NOT NULL REFERENCES products(ID), UID INT(255) UNSIGNED NOT NULL REFERENCES users(ID), createdTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updatedTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP, rating INT(255) NOT NULL, commentText INT(255) UNSIGNED NOT NULL REFERENCES media(ID), PRIMARY KEY(PID, UID))`,
    refreshtokens: `CREATE TABLE IF NOT EXISTS refreshtokens (token VARCHAR(255) NOT NULL PRIMARY KEY, UID INT(255) UNSIGNED NOT NULL REFERENCES users(ID), expiryDate TIMESTAMP NOT NULL)`,
  },
}

export const createDefaultTables = async () => {
  for (let q of Object.entries(dbQueries.exportTableQueries)) {
    await new DBService().query(q[1])
  }
  return 'Finished'
}
export const dropAllTables = async () => {
  const all = Object.keys(dbQueries.exportTableQueries)

  all.reverse()

  for (let q of all) await new DBService().query(`drop table if exists ${q}`)
}

export default DBService

// ;(async () => {
//   await dropAllTables()
//   await createDefaultTables()
// })()
