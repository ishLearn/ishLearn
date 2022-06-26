import express from 'express'
import { body, validationResult } from 'express-validator'

import { validateResult } from './users'

import {
  performSignin,
  refreshAccessToken,
} from '../controllers/AuthController'
import RefreshToken from '../models/RefreshToken'
import { UserRecord } from '../types/users'
import Logger from '../utils/Logger'

const router = express.Router()

// GET /api/auth/signin
// Sign in the user with `email` and `pwd` via `req.body`
// returns to the user:
// {
//     refreshToken: RefreshToken;
//     accessToken: string;
//     userInfo: {
//         emailTmp: string | null;
//         id: ID;
//         rank: string;
//         firstName: string;
//         lastName: string;
//         profilePicture: string | null;
//         profileText: string | null;
//     };
// }
router.post(
  '/signin',
  body('email').isEmail(),
  body('pwd').isLength({ min: 8 }),
  validateResult,
  async (req: express.Request, res: express.Response<{}, UserRecord>) => {
    const { email, pwd } = req.body

    try {
      const { refreshToken, accessToken, userInfo } = await performSignin(
        email,
        pwd
      )

      if (typeof userInfo.id === 'undefined') {
        const newErr: any = new Error('Not found')
        newErr.statusCode = 404
        throw newErr
      }

      const totalUserTokens = await RefreshToken.findTokensByID(userInfo.id)

      return res.status(200).json({
        refreshToken,
        accessToken,
        userInfo,
        totalUserTokens: totalUserTokens.length,
      })
    } catch (err: any) {
      new Logger().error(
        'Sign In',
        'General route handler after body validation',
        err
      )
      res.status(err.statusCode || 400).json({ error: err.message })
    }
  }
)

// POST /api/auth/refresh
// Acquire a new access token using a refresh token.
router.post(
  '/refresh',
  validateResult,
  async (_req: express.Request, res: express.Response<{}, UserRecord>) => {
    // Token in locals is from `req.body`
    const token = res.locals.refreshToken

    if (typeof token !== 'string')
      return res.status(401).json({
        error:
          'You must send a refresh token in order to get a new access token.',
      })

    try {
      const newToken = await refreshAccessToken(token)
      return res.status(200).json(newToken)
    } catch (err) {
      console.log(token)
      return res.status(403).json({ error: 'Refresh token is invalid' })
    }
  }
)

// POST /api/auth/signout
// Sign out a user (remove refresh token from DB)
router.post(
  '/signout',
  validateResult,
  async (_req: express.Request, res: express.Response<{}, UserRecord>) => {
    const token = res.locals.refreshToken

    if (typeof token !== 'string')
      return res.status(401).json({
        error: 'You are not logged in.',
      })

    await RefreshToken.removeTokenByToken(token)
    return res.status(200).json({
      msg: 'Successfully signed out!',
    })
  }
)

export default router
