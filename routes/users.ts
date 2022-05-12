import express from 'express'
import { body, validationResult } from 'express-validator'

const router = express.Router()

router.get('/', (req: express.Request, res: express.Response) => {
  res.status(200).json({
    message: 'TODO: Send the current logged in user',
    ok: true,
  })
})

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

  (req: express.Request, res: express.Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body // TODO: More params, !!!: validator

    // const newUser = new User(email, password)
  }
)

/**
 * Update current User.
 *
 * All fields can be updated, however some do require extra work and thus have their own endpoint
 */
router.put('/', (req: express.Request, res: express.Response) => {})

/**
 * Update current User's email.
 *
 * TODO: Set the data flow, will there be a temp table for storing the new email that is currently being validated?
 */
router.put('/email', (req: express.Request, res: express.Response) => {})

export default router