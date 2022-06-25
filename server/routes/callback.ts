import express from 'express'
import EmailToken from '../models/EmailToken'
import User from '../models/User'

const router = express.Router()

// Get the action the token is allowed to perform
router.get(
  '/',
  async (req: express.Request<{}, {}, { token: string }>, res) => {
    const token = req.body.token

    const dbToken = await EmailToken.getTokenFromDB(token)

    if (dbToken.action === 'passwordReset')
      return res.status(200).json({ action: '/user/reset/pwd' })
  }
)

// Perform the action, potentially after further user input
router.post(
  '/',
  async (
    req: express.Request<
      {},
      {},
      { token: string; password?: string; passwordCtrl?: string }
    >,
    res
  ) => {
    const token = req.body.token

    const dbToken = await EmailToken.getTokenFromDB(token)

    // See EmailService.actions for the entire list of actions
    switch (dbToken.action) {
      case 'passwordReset':
        if (
          typeof req.body.password !== 'undefined' &&
          req.body.password === req.body.passwordCtrl
        ) {
          await User.updatePwd(dbToken.UID, req.body.password)
          return res.status(200).json({ success: true })
        }
        break
    }
    return res.status(404).json({ error: 'Action not found' })
  }
)

export default router
