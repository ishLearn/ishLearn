import express, { Router } from 'express'
import { body } from 'express-validator'

import { validateResult } from '../users'

import Media from '../../models/Media'
import { UserRecord } from '../../types/users'

const router: Router = Router()

// POST /api/files/download/
// Get a file from S3. Filename includes the whole path
// Does the same as the GET-Request listed below
router.post(
  '/',
  body('filename').trim().isLength({ min: 3 }),
  validateResult,
  async (req: express.Request, res: express.Response<{}, UserRecord>) => {
    const { filename } = req.body

    // res status and json done inside of upload
    await Media.downloadMedia(filename, res)
  }
)

// GET /api/files/download
// Get a file from S3
router.get(
  '/*',
  async (req: express.Request, res: express.Response<{}, UserRecord>) => {
    const url = req.url.substring(1).replace(new RegExp('%20', 'g'), ' ')

    await Media.downloadMedia(url, res, true)
  }
)

export default router
