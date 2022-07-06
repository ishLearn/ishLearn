import moment from 'moment'
import { v4 as uuid } from 'uuid'

import DBService, { getIntIDFromHash } from '../services/DBService'

export default class EmailToken {
  token: string
  action: string
  expiryDate: Date
  UID: string

  constructor(token: string, action: string, uid: string, expiryDate: Date) {
    this.token = token
    this.action = action
    this.expiryDate = expiryDate
    this.UID = uid
  }

  /**
   * Create an email Token, which is automatically inserted into the DB.
   * @param userId User to create token for
   * @param action action to be performed on call
   * @returns The newly created token
   */
  static async getNewToken(
    userId: string,
    action: string
  ): Promise<EmailToken> {
    const date = moment(new Date()).add(1, 'days').toDate()

    const token = uuid()
    const expiryDate = moment(date).format('YYYY-MM-DD HH:mm:ss')

    const uid = getIntIDFromHash(userId)
    const res = await new DBService().query(
      `INSERT INTO emailTokens (token, action, UID, expiryDate) VALUES (?, ?, ?, ?)`,
      [token, action, uid, expiryDate]
    )

    if (
      typeof res.results.affectedRows === 'undefined' ||
      res.results.affectedRows === 0
    )
      throw new Error(`Could not insert email token into DB.`)

    return new EmailToken(token, action, userId, date)
  }

  /**
   * Get an EmailToken entry from the DB.
   * @param token String token (UUID) to search for
   * @returns The found token from the database
   */
  static async getTokenFromDB(
    token: string,
    deleteAfterFound?: boolean
  ): Promise<EmailToken> {
    const res = (
      await new DBService().query(`SELECT * FROM emailTokens WHERE token = ?`, [
        token,
      ])
    ).results

    if (
      deleteAfterFound
      // && res.
    )
      EmailToken.deleteTokenFromDB(token)

    return new EmailToken(
      res[0].token,
      res[0].action,
      res[0].UID,
      res[0].expiryDate
    )
  }

  static async deleteTokenFromDB(token: string): Promise<void> {
    await new DBService().query(`DELETE FROM emailTokens WHERE token = ?`, [
      token,
    ])
  }
}
