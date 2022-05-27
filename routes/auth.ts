import express from 'express'
import { body, validationResult } from 'express-validator'
import {
  performSignin,
  refreshAccessToken,
} from '../controllers/AuthController'
import RefreshToken from '../models/RefreshToken'
import { UserRecord } from '../types/users'

const router = express.Router()

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

      return res.status(200).json({ refreshToken, accessToken, userInfo })
    } catch (err: any) {
      console.log(err.statusCode)
      console.log(err.message)
      console.log(JSON.parse(JSON.stringify(err)))
      res.status(err.statusCode || 400).json({ error: err.message })
    }
  }
)

router.post(
  '/refresh',
  async (req: express.Request, res: express.Response<{}, UserRecord>) => {
    const errors = validationResult(req)
    if (!errors.isEmpty())
      return res.status(400).json({ error: errors.array() })

    const token = req.body.refreshToken // TODO: Get token from header?
    const newToken = await refreshAccessToken(token)

    return res.status(200).json({
      refreshToken: token,
      accessToken: newToken,
    })
  }
)

router.post(
  '/signout',
  async (req: express.Request, res: express.Response<{}, UserRecord>) => {
    const errors = validationResult(req)
    if (!errors.isEmpty())
      return res.status(400).json({ error: errors.array() })

    const token = req.body.refreshToken // TODO: Get token from header?

    await RefreshToken.removeTokenByToken(token)
    return res.status(200).json({
      msg: 'Successfully signed out!',
    })
  }
)

export default router
