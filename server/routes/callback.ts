import express from 'express'
import EmailToken from '../models/EmailToken'
import User from '../models/User'
import EmailService from '../services/EmailService'

const router = express.Router()

// Get the action the token is allowed to perform
router.get(
  '/',
  async (req: express.Request<{}, {}, { token: string }>, res) => {
    const token = req.body.token

    const dbToken = await EmailToken.getTokenFromDB(token)

    if (dbToken.action === EmailService.actions.pwdForgotten)
      return res.status(200).json({ action: '/user/reset/pwd' })
    if (dbToken.action === EmailService.actions.confirmNewEmail) {
      res.send({ action: 'confirming email', end: false })

      try {
        const affectedRows = await User.confirmTmpEmail(dbToken.UID)
        return res
          .status(200)
          .json({ msg: 'Update complete', affectedRows, end: true })
      } catch (err) {
        return res.status(400).json({
          error: `If the User ID is correct, there is no verification of a new email address pending.`,
        })
      }
    }
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
