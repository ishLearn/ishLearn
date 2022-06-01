import express from 'express'
import { body, validationResult } from 'express-validator'
import User from '../models/User'
import { UserRecord } from '../types/users'
import bcrypt from 'bcrypt'

const router = express.Router()

router.get(
  '/',
  (_req: express.Request, res: express.Response<{}, UserRecord>) => {
    res.status(200).json({
      ok: true,
      user: res.locals.user,
    })
  }
)

/**
 * POST /api/users
 * Create a new user
 */
router.post(
  '/',
  // Use express-validator middleware functions
  // to validate the request body
  body('email').isEmail().normalizeEmail(), //TODO: Sanitize email or just leave it as is?
  body('password').trim().isLength({ min: 8 }),
  body('rank').trim().isLength({ min: 5, max: 7 }),
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 }),
  // body('birthday').isDate(),
  async (req: express.Request, res: express.Response<{}, UserRecord>) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password, rank, firstName, lastName, birthday } = req.body

    if (rank !== 'teacher' && rank !== 'student')
      return res.status(400).json({ error: 'Invalid rank' })

    const newPassword = await User.hashPwd(password)

    const newUser = new User(
      email,
      newPassword,
      rank,
      firstName,
      lastName,
      null,
      null,
      birthday
    )

    try {
      const results = await newUser.save()
      const id = results.id

      return res.status(200).json({
        success: true,
        id,
      })
    } catch (err) {
      return res.status(400).json({
        error:
          'Could not be saved. Is the email already taken or is the rank invalid?',
      })
    }
  }
)

/**
 * Update current User.
 *
 * All fields can be updated, however some do require extra work and thus have their own endpoint
 */
router.put(
  '/',
  (req: express.Request, res: express.Response<{}, UserRecord>) => {
    // TODO:
  }
)

/**
 * Update current User's email.
 */
router.put(
  '/email',
  body('email').trim().isEmail(),
  body('emailCtrl').trim().isEmail(),
  async (req, res: express.Response<{}, UserRecord>) => {
    const user = res.locals.user
    if (typeof user === 'undefined')
      return res.status(403).json({ error: 'User is not authenticated!' })
    const { email, emailCtrl } = req.body
    if (!email || !emailCtrl || email === emailCtrl)
      return res.status(400).json({ error: 'The passwords must match!' })

    try {
      const affectedRows = await User.updateEmail(user.id, email)
      return res.status(200).json({ msg: 'Update complete', affectedRows })
    } catch (err) {
      return res.status(400).json({
        error: `If the User ID is correct, there is no confirmation of a new email address pending.`,
        currentMail: user.email,
      })
    }
  }
)

/**
 * Update password for current user.
 */
router.put(
  '/password',
  body('password').trim().isLength({ min: 8 }),
  body('passwordCtrl').trim().isLength({ min: 8 }),
  async (req, res: express.Response<{}, UserRecord>) => {
    const user = res.locals.user
    if (typeof user === 'undefined')
      return res.status(403).json({ error: 'User is not authenticated!' })
    const { password, passwordCtrl } = req.body
    if (!password || !passwordCtrl || password === passwordCtrl)
      return res.status(400).json({ error: 'The passwords must match!' })

    const affectedRows = await User.updatePwd(user.id, password)
    return res.status(200).json({ msg: 'Update complete', affectedRows })
  }
)

export default router
