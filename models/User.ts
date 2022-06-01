import bcrypt from 'bcrypt'
import DBService, {
  getHashFromIntID,
  getIntIDFromHash,
} from '../services/DBService'

import Logger from '../utils/Logger'

import { ID } from '../types/ids'
import Media from './Media'
import { NumberLike } from 'hashids/cjs/util'

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
  static getProfilePictureFileName(uid: string) {
    return `picture-${uid}.png`
  }
  static getProfilePictureFilePath(uid: string) {
    return `profile/${User.getProfilePictureFileName(uid)}`
  }
  static getProfileTextFileName(uid: string) {
    return `text-${uid}.md`
  }
  static getProfileTextFilePath(uid: string) {
    return `profile/${User.getProfileTextFileName(uid)}`
  }

  id: ID
  email: string
  emailTmp: string | null = null
  password: string
  rank: string
  firstName: string
  lastName: string
  birthday: Date | null
  profilePicture: string | null
  profileText: string | null

  /**
   * Create a User based on
   * @param email the User's email
   * @param password the User's password hash
   * @param rank the User's rank, can be one of the enum
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
    rank: string,
    firstName: string,
    lastName: string,
    profilePicture: string | null,
    profileText: string | null,
    birthday?: Date | null,
    id?: ID | number
  ) {
    this.email = email
    this.password = password
    this.rank = rank
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
      fields = [
        'id',
        'email',
        'rank',
        'emailTmp',
        'profilePicture',
        'profileText',
      ]
    const result = (
      await new DBService().query('SELECT ?? FROM users WHERE email = ?', [
        fields,
        email,
      ])
    ).results[0]

    return new User(
      result.email,
      result.password,
      result.rank,
      result.firstName,
      result.lastName,
      result.profilePicture,
      result.profileText,
      result.birthday,
      result.id
    )
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
      'ID',
      'email',
      'emailTmp',
      'password',
      'rank',
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
    rank: string
    firstName: string
    lastName: string
    profilePicture: string | null
    profileText: string | null
  } {
    const { id, rank, firstName, lastName, profilePicture, profileText } = this
    return { id, rank, firstName, lastName, profilePicture, profileText }
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
      `INSERT INTO users (email, password, rank, firstName, lastName, profileText, profilePicture, birthday) VALUES (?)`,
      [
        [
          this.email,
          this.password,
          this.rank,
          this.firstName,
          this.lastName,
          this.profileText,
          this.profilePicture,
          this.birthday,
        ],
      ]
    )

    this.id = res.results.insertId
    return this
  }

  /**
   * Update the email of a user; temporarily store into emailTmp in DB.
   * @param uid User ID to update email for
   * @param email New email
   * @returns The number of affected DB rows
   */
  static async updateEmail(uid: ID, email: string) {
    if (typeof uid === 'undefined') throw new Error('Invalid UID')
    const res = await new DBService().query(
      `UPDATE users SET emailTmp = ? WHERE id = ?`,
      [email, typeof uid === 'string' ? getIntIDFromHash(uid) : uid]
    )
    return res.results.affectedRows
  }

  /**
   * Confirm the current `emailTmp` of a user.
   * @param uid The (unhashed) ID of the user
   * @returns The number of affected DB rows
   */
  static async confirmTmpEmail(uid: ID) {
    if (typeof uid === 'undefined') throw new Error('Invalid UID')
    const { emailTmp } = await User.getFullUserById(uid)
    const id = typeof uid === 'string' ? getIntIDFromHash(uid) : uid

    if (emailTmp === null) throw new Error('Email is not to be confirmed.')

    const res = await new DBService().query(
      `UPDATE users SET email = ?, emailTmp = NULL WHERE id = ?`,
      [emailTmp, id]
    )
    return res.results.affectedRows
  }

  // TODO: Implement routes for email verification

  /**
   * Update the password of a user.
   * @param uid User ID to update password for
   * @param password New password, unhashed
   * @returns The number of affected DB rows
   */
  static async updatePwd(
    uid: ID,
    password: string
  ): Promise<number | undefined> {
    if (typeof uid === 'undefined') throw new Error('Invalid UID')
    const res = await new DBService().query(
      `UPDATE users SET pwd = ? WHERE id = ?`,
      [
        User.hashPwd(password),
        typeof uid === 'string' ? getIntIDFromHash(uid) : uid,
      ]
    )
    return res.results.affectedRows
  }

  /**
   * Update the birthday of a user.
   * @param uid User ID to update birthday for
   * @param birthday New birthday
   * @returns The number of affected DB rows
   */
  static async updateBirthday(uid: ID, birthday: Date) {
    if (typeof uid === 'undefined') throw new Error('Invalid UID')
    const res = await new DBService().query(
      `UPDATE users SET birthday = ? WHERE id = ?`,
      [birthday, typeof uid === 'string' ? getIntIDFromHash(uid) : uid]
    )
    return res.results.affectedRows
  }

  // PROFILE PICTURE / TEXT
  /**
   *
   * @param uid UserID (hashed)
   * @param text Text content for user description
   */
  static async uploadProfilePictureThenSaveToDB(uid: string, text: string) {
    const filepath = User.getProfilePictureFilePath(uid)

    const res = await Media.uploadMedia(filepath, Buffer.from(text), {
      useNameAsPath: true,
    })

    if (typeof res === 'undefined' || !('worked' in res) || !res.worked)
      throw new Error(`Could not upload comment to S3`)

    const mId = await Media.saveToMediaOnly(
      User.getProfilePictureFileName(uid),
      filepath
    )

    return await User.saveProfilePicture(uid, mId)
  }

  static async saveProfilePicture(uid: string, mid: NumberLike) {
    const mediaPartOfProduct = await new DBService().query(
      `UPDATE users SET profilePicture = ? WHERE id = ?`,
      [mid, getIntIDFromHash(uid)]
    )
    return mediaPartOfProduct.results.insertId as NumberLike
  }

  /**
   *
   * @param uid UserID (hashed)
   * @param text Text content for user description
   */
  static async uploadProfileTextThenSaveToDB(uid: string, text: string) {
    const filepath = User.getProfileTextFilePath(uid)

    const res = await Media.uploadMedia(filepath, Buffer.from(text), {
      useNameAsPath: true,
    })

    if (typeof res === 'undefined' || !('worked' in res) || !res.worked)
      throw new Error(`Could not upload comment to S3`)

    const mId = await Media.saveToMediaOnly(
      User.getProfileTextFileName(uid),
      filepath
    )

    return await User.saveProfileText(uid, mId)
  }

  static async saveProfileText(uid: string, mid: NumberLike) {
    const mediaPartOfProduct = await new DBService().query(
      `UPDATE users SET profileText = ? WHERE id = ?`,
      [mid, getIntIDFromHash(uid)]
    )
    return mediaPartOfProduct.results.insertId as NumberLike
  }
}
