import bcrypt from 'bcrypt'
import DBService, {
  getHashFromIntID,
  getIntIDFromHash,
} from '../services/DBService'

import Logger from '../utils/Logger'

import { ID } from '../types/ids'

const saltRounds = Number(process.env.SALT_ROUNDS) || 10

/**
 * A User is every Account that can interact with the system.
 * It's Primary Key is a AUTO-INCREMENT INT ID, for the Frontend
 * hashed with the {@link https://www.npmjs.com/package/hashids hashids} package.
 *
 * @see {@link User.id}
 * @author Sebastian Thomas
 */
export default class User {
  // TODO: Add more params for User (from ER)
  id: ID
  email: string
  emailTmp: string | null = null
  password: string
  firstName: string
  lastName: string
  birthday: Date | null
  profilePictures: string[] // TODO: Foreign Key?
  profileText: string // TODO: Foreign Key?

  /**
   * Create a User based on
   * @param email the User's email
   * @param password the User's password hash
   * @param id the User's ID. Optional: Will be auto generated (AUTO_INCREMENT) if not specified
   */
  constructor(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    profilePictures: string[],
    profileText: string,
    birthday?: Date,
    id?: ID | number
  ) {
    this.email = email
    this.password = password
    this.firstName = firstName
    this.lastName = lastName
    this.profilePictures = profilePictures
    this.profileText = profileText
    this.birthday = typeof birthday !== 'undefined' ? birthday : null
    this.id = typeof id === 'number' ? getHashFromIntID(id) : id
  }

  /**
   * Retrieve the specified fields from a user from the DB, and return it.
   *
   * @param idInput The ID to search for. Can be provided as either number (search for the exact number ID in the DB) or string (search for the decoded ID in the DB).
   * @param fields The fields (columns) to retrieve
   * @returns The found User in the DB or
   * @throws Error if the user is not found
   */
  static async getUserById(
    idInput: number | string,
    fields: string[]
  ): Promise<User> {
    const id = typeof idInput === 'string' ? getIntIDFromHash(idInput) : idInput
    return (
      await new DBService().query('SELECT ?? FROM users WHERE id = ?', [
        fields,
        id,
      ])
    ).results
  }

  // TODO: More params to leave out, not just pwd?
  /**
   * Retrieve a User from the DB, and return it.
   * All fields are retrieved except for the Password Hash.
   *
   * @param id The ID to search for
   * @returns The found User in the DB or
   * @throws Error if the User is not found
   */
  static async getFullUserById(id: string): Promise<User> {
    // TODO: What other fields to retrieve?
    return await User.getUserById(id, ['email'])
  }

  /**
   * Get the data that is not critical from a User
   * @returns An object with the User's ID and other public information
   */
  getNormalData(): {
    id: ID
  } {
    return {
      id: this.id,
    }
  }

  /**
   * Hash a password with [bcrypt](https://www.npmjs.com/package/bcrypt).
   * @param pwd The password to hash
   * @returns Hash of the password
   */
  static hashPwd(pwd: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      bcrypt.genSalt(saltRounds, (err: Error | undefined, salt: string) => {
        if (err) {
          new Logger().error('Hashing password', 'Generating Salt', err)
          return reject(err)
        }
        bcrypt.hash(pwd, salt, (err: any, hash: string) => {
          if (err) {
            new Logger().error('Hashing password', 'Generating Hash', err)
            return reject(err)
          }
          return resolve(hash)
        })
      })
    })
  }

  static comparePwd(pwd: string, hash: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      bcrypt.compare(pwd, hash, (err: any, result: boolean) => {
        if (err) {
          new Logger().error('Compare password', 'Compare password', err)
          return reject(err)
        }

        return resolve(result)
      })
    })
  }
}
