import express, { Router } from 'express'

import Media from '../../models/Media'
import { UserRecord } from '../../types/users'

const router: Router = Router()

// POST /api/files/download/
// Get a file from S3. Filename includes the whole path
// Does the same as the GET-Request listed below
router.post(
  '/',
  async (req: express.Request, res: express.Response<{}, UserRecord>) => {
    const { filename } = req.body

    // res status and json done inside of upload
    await Media.downloadMedia(filename, res)
  }
)

// GET /api/files/download
// Get a file from S3
router.get(
  '/:filename',
  async (req: express.Request, res: express.Response<{}, UserRecord>) => {
    await Media.downloadMedia(req.params.filename, res)
  }
)

export default router
