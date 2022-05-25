import express from 'express'
import { body, validationResult } from 'express-validator'
import { performSignin } from '../controllers/AuthController'

const router = express.Router()

router.post(
  '/signin',
  body('email').isEmail(),
  body('pwd').isLength({ min: 1 }),
  async (req: express.Request, res: express.Response) => {
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

export default router
