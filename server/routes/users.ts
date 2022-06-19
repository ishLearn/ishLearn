import express from 'express'
import { body, validationResult } from 'express-validator'
import User from '../models/User'
import { UserRecord } from '../types/users'
import DBService from '../services/DBService'

export const validateResult = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  return next()
}

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
  body('birthday').isDate(),
  validateResult,
  async (req: express.Request, res: express.Response<{}, UserRecord>) => {
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
 * All fields can be updated, however some do require extra work and thus have their own endpoint:
 * This endpoint works for
 * - firstName
 * - lastName
 */
router.put(
  '/',
  async (req: express.Request, res: express.Response<{}, UserRecord>) => {
    const user = res.locals.user
    if (typeof user === 'undefined')
      return res.status(403).json({ error: 'User is not authenticated!' })

    // firstName, lastName, birthday, profileText
    const params: {
      paramStrings: string[]
      paramArray: any[]
    } = {
      paramStrings: [],
      paramArray: [],
    }

    if (req.body.firstName && req.body.firstName.length > 1) {
      params.paramStrings.push('firstName = ?')
      params.paramArray.push(req.body.firstName)
    }
    if (req.body.lastName && req.body.lastName.length > 1) {
      params.paramStrings.push('lastName = ?')
      params.paramArray.push(req.body.lastName)
    }

    if (
      params.paramStrings.length < 1 ||
      params.paramArray.length < 1 ||
      params.paramStrings.length !== params.paramArray.length
    )
      return res
        .status(400)
        .json({ error: 'Invalid number of parameters or server side error' })

    const query = `UPDATE users SET ${params.paramStrings.join(
      ', '
    )} WHERE id = ?`

    return await new DBService().query(query, params.paramArray)
  }
)

/**
 * Update current User's email.
 */
router.put(
  '/email',
  body('email').trim().isEmail(),
  body('emailCtrl').trim().isEmail(),
  validateResult,
  async (req, res: express.Response<{}, UserRecord>) => {
    const user = res.locals.user
    if (typeof user === 'undefined')
      return res.status(403).json({ error: 'User is not authenticated!' })
    const { email, emailCtrl } = req.body
    if (!email || !emailCtrl || email === emailCtrl)
      return res.status(400).json({ error: 'The emails must match!' })

    try {
      const affectedRows = await User.updateEmail(user.id, email)
      return res.status(200).json({ msg: 'Update complete', affectedRows })
    } catch (err) {
      return res.status(403).json({
        error: `User is not logged in`,
      })
    }
  }
)

/**
 * Update current User's email.
 */
router.put(
  '/email/confirm',
  validateResult,
  async (req: express.Request, res: express.Response<{}, UserRecord>) => {
    const user = res.locals.user
    if (typeof user === 'undefined' || typeof user.id === 'undefined')
      return res.status(403).json({ error: 'User is not authenticated!' })

    try {
      const affectedRows = await User.confirmTmpEmail(user.id)
      return res.status(200).json({ msg: 'Update complete', affectedRows })
    } catch (err) {
      return res.status(400).json({
        error: `If the User ID is correct, there is no verification of a new email address pending.`,
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
  validateResult,
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

/**
 * Update current User's email.
 */
router.put(
  '/birthday',
  body('birthday').isDate(),
  validateResult,
  async (req, res: express.Response<{}, UserRecord>) => {
    const user = res.locals.user
    if (typeof user === 'undefined')
      return res.status(403).json({ error: 'User is not authenticated!' })
    const { birthday } = req.body

    const affectedRows = await User.updateBirthday(user.id, birthday)
    return res.status(200).json({ msg: 'Update complete', affectedRows })
  }
)

/**
 * PUT /api/users/profile/picture
 * Update the current profile picture
 */
router.put('/profile/picture', (req, res: express.Response<{}, UserRecord>) => {
  const user = res.locals.user
  if (typeof user === 'undefined' || typeof user.id === 'undefined')
    return res.status(403).json({ error: 'User is not authenticated!' })
  // TODO: Use picture instead of string, requires File Upload
  const { picture } = req.body

  const affectedRows = User.uploadProfilePictureThenSaveToDB(user.id, picture)
  return res.status(200).json({ msg: 'Profile picture updated', affectedRows })
})

/**
 * PUT /api/users/profile/text
 * Update the current profile picture
 */
router.put(
  '/profile/text',
  body('text').trim(),
  (req, res: express.Response<{}, UserRecord>) => {
    const user = res.locals.user
    if (typeof user === 'undefined' || typeof user.id === 'undefined')
      return res.status(403).json({ error: 'User is not authenticated!' })
    const { text } = req.body

    const affectedRows = User.uploadProfilePictureThenSaveToDB(user.id, text)
    return res.status(200).json({ msg: 'Profile text updated', affectedRows })
  }
)

export default router
