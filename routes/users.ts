import express from 'express'
import { body, validationResult } from 'express-validator'
import User from '../models/User'
import { UserRecord } from '../types/users'
import Logger from '../utils/Logger'

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
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 }),
  body('birthday').isDate(),
  async (req: express.Request, res: express.Response<{}, UserRecord>) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password, firstName, lastName, birthday } = req.body

    const newUser = new User(
      email,
      password,
      firstName,
      lastName,
      null,
      null,
      birthday
    )

    try {
      // TODO: Double emails? => will MySQL throw an error that is caught below? Then change error msg to clear "already taken"
      const results = await newUser.save()

      return res.status(200).json({
        success: true,
      })
    } catch (err) {
      return res
        .status(400)
        .json({ error: 'Could not be saved. Is the email already taken?' })
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
 *
 * TODO: Set the data flow, with the temp variable for storing the new email that is currently being validated?
 */
router.put(
  '/email',
  (req: express.Request, res: express.Response<{}, UserRecord>) => {
    // TODO:
  }
)

export default router
