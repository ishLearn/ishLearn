import bcrypt from 'bcrypt'
import { v4 as uuid } from 'uuid'
import DBService from '../services/DBService'

import Logger from '../utils/Logger'

const saltRounds = Number(process.env.SALT_ROUNDS) || 10

/**
 * A User is every Account that can interact with the system. It's Primary Key is a random UUID.
 *
 * @see {@link User.id}
 * @author Sebastian Thomas
 */
export default class User {
  // TODO: Add more params for User (from ER)
  id: string
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
   * @param id the User's ID. Optional: Will be auto generated (as [uuidV4](com/package/uuid)) if not specified
   */
  constructor(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    profilePictures: string[],
    profileText: string,
    birthday?: Date,
    id?: string
  ) {
    this.email = email
    this.password = password
    this.firstName = firstName
    ;(this.lastName = lastName), (this.profilePictures = profilePictures)
    this.profileText = profileText
    this.birthday = typeof birthday !== 'undefined' ? birthday : null

    if (!id) {
      // TODO: The User is new and not yet saved in the DB
      this.id = uuid()
    } else this.id = id
  }

  /**
   * Retrieve the specified fields from a user from the DB, and return it.
   *
   * @param id THe ID to search for
   * @param fields The fields (columns) to retrieve
   * @returns The found User in the DB or
   * @throws Error if the user is not found
   */
  static async getUserById(id: string, fields: string[]): Promise<User> {
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
    id: string
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
