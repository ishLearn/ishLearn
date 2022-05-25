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
  id: ID
  email: string
  emailTmp: string | null = null
  password: string
  firstName: string
  lastName: string
  birthday: Date | null
  profilePicture: string | null
  profileText: string | null

  /**
   * Create a User based on
   * @param email the User's email
   * @param password the User's password hash
   * @param firstName the User's first name
   * @param lastName the User's last name
   * @param profilePicture the User's profile picture's links
   * @param profileText the User's profile text link
   * @param birthday the User's birth date; if specified, otherwise null
   * @param id the User's ID. Optional: Will be auto generated (AUTO_INCREMENT) if not specified
   */
  constructor(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    profilePicture: string | null,
    profileText: string | null,
    birthday?: Date, // TODO: Can this be undefined, or is the possibility between 'Date | null' ?
    id?: ID | number
  ) {
    this.email = email
    this.password = password
    this.firstName = firstName
    this.lastName = lastName
    this.profilePicture = profilePicture
    this.profileText = profileText
    this.birthday = typeof birthday !== 'undefined' ? birthday : null
    this.id = typeof id === 'number' ? getHashFromIntID(id) : id
  }

  /**
   * Retrieve the specified fields from a user from the DB, and return it.
   *
   * @param idInput The ID to search for. Can be provided as either number (search for the exact number ID in the DB) or string (search for the decoded ID in the DB).
   * @param fields The fields (columns) to retrieve
   * @returns The found User in the DB or undefined if the user is not found
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
    ).results[0]
  }

  /**
   * Retrieve a user from the DB identified by the Email address, and return it.
   *
   * @param email The Email to search for.
   * @param fields The fields (columns) to retrieve
   * @returns The found User in the DB or `undefined` if the user is not found.
   */
  static async findByEmail(email: string, fields?: string[]): Promise<User> {
    if (typeof fields === 'undefined')
      fields = ['id', 'email', 'emailTmp', 'profilePicture', 'profileText']
    return (
      await new DBService().query('SELECT ?? FROM users WHERE email = ?', [
        fields,
        email,
      ])
    ).results[0]
  }

  /**
   * Retrieve a User from the DB, and return it.
   * Retrieved fields:
   * - email
   * - password hash
   * - first name
   * - last name
   * - profile pictures urls
   * - profile text url
   * - birthday
   *
   * @param id The ID to search for
   * @returns The found User in the DB
   * @throws Error if the User is not found
   */
  static async getFullUserById(id: string): Promise<User> {
    return await User.getUserById(id, [
      'email',
      'password',
      'firstName',
      'lastName',
      'profilePictures',
      'profileText',
      'birthday',
    ])
  }

  /**
   * Get the data that is not critical from a User
   * @returns An object with the User's ID and other public information
   */
  getNormalData(): {
    id: ID
    firstName: string
    lastName: string
    profilePicture: string | null
    profileText: string | null
  } {
    const { id, firstName, lastName, profilePicture, profileText } = this
    return { id, firstName, lastName, profilePicture, profileText }
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

  /**
   * Compare two passwords (text and hash) and return the result.
   * @param pwd The clear text input password from client
   * @param hash The has to validate the password against
   * @returns A promise resolving when the password has been compared; boolean indicating whether the password is correct (true) or not (false)
   */
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

  /**
   * Save the user to the database.
   * @returns The new User
   */
  async save(): Promise<User> {
    if (typeof this.id !== 'undefined')
      throw new Error('Product has already been saved')
    const res = await new DBService().query(
      `INSERT INTO users (email, password, firstName, lastName, profileText, profilePicture, birthday) VALUES (?)`,
      [
        [
          this.email,
          this.password,
          this.firstName,
          this.lastName,
          this.profileText,
          this.profilePicture,
          this.birthday,
        ],
      ]
    )
    console.log(res.results)

    this.id = res.results[0].ID || res.results[0].id
    return this
  }
}
