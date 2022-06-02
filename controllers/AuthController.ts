import User from '../models/User'
import jwt from 'jsonwebtoken'
import RefreshToken from '../models/RefreshToken'
import Logger from '../utils/Logger'

/**
 * Performs a sign in for a user:
 * - save a new refresh token to DB
 * - return that refresh and a newly generated access token (JWT)
 *
 * Checks whether the user exists.
 * @param email the email address input by the user
 * @param password the password input by the user
 * @returns All information for the user to be sent to client (refresh and access token as well as some information)
 *
 * @throws Error with param `statusCode = 403` if user does not exists (username not found) or the password is incorrect
 */
export const performSignin = async (email: string, password: string) => {
  const user = await User.findByEmail(email)
  if (typeof user === 'undefined' || typeof user.id === 'undefined') {
    const err: any = new Error(`Password or username is wrong!`)
    err.statusCode = '403'
    throw err
  }

  if (!(await User.comparePwd(password, user.password))) {
    const err: any = new Error(`Password or username is wrong!`)
    err.statusCode = '403'
    throw err
  }

  const accessToken = genAccessToken(user.id)
  const refreshToken = RefreshToken.createToken({ id: user.id })

  await refreshToken.save()

  const normalData = user.getNormalData()
  return {
    refreshToken,
    accessToken,
    userInfo: {
      ...normalData,
      emailTmp: user.emailTmp,
    },
  }
}

/**
 * Refresh the access token for the current user.
 * @param reqToken The refresh token sent with the request
 * @returns A new access token
 * @throws Error with `statusCode = 403` if the refresh token is invalid
 */
export const refreshAccessToken = async (reqToken: string) => {
  try {
    // Find Refresh Token and validate it
    let refreshToken = await RefreshToken.findByToken(reqToken)
    if (!refreshToken) {
      const err: any = new Error(`Refresh token not valid`)
      err.statusCode = '403'
      throw err
    }
    if (RefreshToken.verifyExpiration(refreshToken)) {
      RefreshToken.removeTokenByToken(reqToken)
      const err: any = new Error(`Refresh token not valid`)
      err.statusCode = '403'
      throw err
    }

    // Sign new token
    let newAccessToken = genAccessToken(refreshToken.userId)
    return {
      accessToken: newAccessToken,
      refreshToken: refreshToken.token,
      tokenObject: refreshToken,
    }
  } catch (err) {
    new Logger().error('User Authentication', 'Refresh Access Token', err)
    throw new Error('Something failed on server, please try again.')
  }
}

/**
 * Generate a new JWT (Access Token) for a user
 * @param userId the user id to generate token with and for
 * @returns The new JWT
 */
const genAccessToken = (userId: string) => {
  const accessTokenJWTSecret = process.env.ACCESS_TOKEN_JWT_SECRET || ''
  const expiresInAccessToken =
    Number(process.env.EXPIRES_IN_ACCESS_TOKEN) || 60 * 60 * 1000

  return jwt.sign({ id: userId }, accessTokenJWTSecret, {
    expiresIn: expiresInAccessToken,
  })
}
