import { v4 as uuid } from 'uuid'
import DBService from '../services/DBService'

export default class RefreshToken {
  token: string
  userId: string
  expiryDate: Date

  constructor(token: string, userId: string, expiryDate: Date) {
    this.token = token
    this.userId = userId
    this.expiryDate = expiryDate
  }

  async save() {
    const res = await new DBService().query(
      `INSERT INTO refreshtokens (token, UID, expiryDate) VALUES (?)`,
      [[this.token, this.userId, this.expiryDate]]
    )

    return res.results[0]
  }

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

  static async removeTokenByToken(token: string) {
    const res = (
      await new DBService().query(`DELETE FROM refreshtokens where token = ?`, [
        token,
      ])
    ).results[0]
    return new RefreshToken(res.token, res.UID, res.expiryDate)
  }
}
