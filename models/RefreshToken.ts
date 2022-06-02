import { NumberLike } from 'hashids/cjs/util'
import { v4 as uuid } from 'uuid'

import moment from 'moment'

import DBService, {
  getHashFromIntID,
  getIntIDFromHash,
} from '../services/DBService'

/**
 * Information about a (currently valid) refresh token.
 *
 * @author @SebastianThomas
 */
export default class RefreshToken {
  token: string
  userId: string
  expiryDate: Date

  /**
   * Create a new refresh token object (does not communicate with the DB)
   * @param token The `uuid` token
   * @param userId The userID this token is associated with
   * @param expiryDate THe date when the token will expire
   */
  constructor(token: string, userId: string, expiryDate: Date) {
    this.token = token
    this.userId = userId
    this.expiryDate = expiryDate
  }

  /**
   * Save a refresh token to the DB
   * @returns The refresh token entry in the DB
   * @throws an error if the SQL query fails
   */
  async save() {
    const res = await new DBService().query(
      `INSERT INTO refreshtokens (token, UID, expiryDate) VALUES (?)`,
      [
        [
          this.token,
          getIntIDFromHash(this.userId),
          moment(this.expiryDate).format('YYYY-MM-DD HH:mm:ss'),
        ],
      ]
    )

    return res.results[0]
  }

  /**
   *
   * @param user The user (with an `id`-field) to create the user for
   * @returns The new Refresh Token object
   */
  static createToken(user: { id: string }) {
    const expiresInRefreshToken: number =
      Number(process.env.EXPIRES_IN_REFRESH_TOKEN) || 120

    const expiredAt = new Date()
    expiredAt.setSeconds(expiredAt.getSeconds() + expiresInRefreshToken)
    const _token = uuid()
    const token = _token
    const userId = user.id
    const expiryDate = new Date(expiredAt.getTime())

    return new RefreshToken(token, userId, expiryDate)
  }

  /**
   * Check if the token has expired
   * @param token token to perform check on
   * @returns true if the token has expired, otherwise false
   */
  static verifyExpiration(token: RefreshToken) {
    return token.expiryDate.getTime() < new Date().getTime()
  }

  /**
   * Find the refresh token's entry in the DB.
   * @param token the refresh token to search for
   * @returns The `RefreshToken` object representing the DB-entry
   */
  static async findByToken(token: string) {
    const results = (
      await new DBService().query(
        `SELECT * FROM refreshtokens where token = ?`,
        [token]
      )
    ).results

    if (!(results.length > 0)) {
      throw new Error('The token is not valid')
    }
    const res = results[0]
    return new RefreshToken(res.token, res.UID, res.expiryDate)
  }

  /**
   * Find the refresh tokens entries in the DB for the current user.
   * @param id the user ID to search for
   * @returns The `RefreshToken`[] objects representing the DB-entry
   */
  static async findTokensByID(id: string) {
    const results = (
      await new DBService().query(`SELECT * FROM refreshtokens where UID = ?`, [
        getIntIDFromHash(id),
      ])
    ).results

    if (!(results.length > 0)) {
      throw new Error('The token is not valid')
    }
    return results.map(
      (res: { token: string; UID: NumberLike; expiryDate: Date }) =>
        new RefreshToken(res.token, getHashFromIntID(res.UID), res.expiryDate)
    ) as RefreshToken[]
  }

  /**
   * Remove the token from the DB (equal to a logout)
   * @param token the refresh token to remove
   * @return Anything if the query is successful
   * @throws an error if the token could not be removed from the DB
   */
  static async removeTokenByToken(token: string) {
    return (
      await new DBService().query(`DELETE FROM refreshtokens where token = ?`, [
        token,
      ])
    ).results[0]
  }
}
