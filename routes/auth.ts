import express from 'express'
import { body, validationResult } from 'express-validator'
import {
  performSignin,
  refreshAccessToken,
} from '../controllers/AuthController'
import RefreshToken from '../models/RefreshToken'
import { UserRecord } from '../types/users'

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
//         firstName: string;
//         lastName: string;
//         profilePicture: string | null;
//         profileText: string | null;
//     };
// }
router.post(
  '/signin',
  body('email').isEmail(),
  body('pwd').isLength({ min: 1 }),
  async (req: express.Request, res: express.Response<{}, UserRecord>) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

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

      const otherUserTokens = await RefreshToken.findTokensByID(userInfo.id)

      return res.status(200).json({
        refreshToken,
        accessToken,
        userInfo,
        otherUserTokens: otherUserTokens.length,
      })
    } catch (err: any) {
      console.log(err.statusCode)
      console.log(err.message)
      console.log(JSON.parse(JSON.stringify(err)))
      res.status(err.statusCode || 400).json({ error: err.message })
    }
  }
)

// POST /api/auth/refresh
// Acquire a new access token using a refresh token.
router.post(
  '/refresh',
  async (req: express.Request, res: express.Response<{}, UserRecord>) => {
    const errors = validationResult(req)
    if (!errors.isEmpty())
      return res.status(400).json({ error: errors.array() })

    // Token in locals is from `req.body`
    const token = res.locals.refreshToken
    if (typeof token !== 'string')
      return res.status(401).json({
        error:
          'You must send a refresh token in order to get a new access token.',
      })

    const newToken = await refreshAccessToken(token)
    return res.status(200).json({
      refreshToken: token,
      accessToken: newToken,
    })
  }
)

// POST /api/auth/signout
// Sign out a user (remove refresh token from DB)
router.post(
  '/signout',
  async (req: express.Request, res: express.Response<{}, UserRecord>) => {
    const errors = validationResult(req)
    if (!errors.isEmpty())
      return res.status(400).json({ error: errors.array() })

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
