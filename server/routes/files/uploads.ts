import express, { Router } from 'express'
import fileUpload, { UploadedFile } from 'express-fileupload'
import { body } from 'express-validator'

import { validateResult } from '../users'

import Media from '../../models/Media'
import { UserRecord } from '../../types/users'
import { requireAuthenticated } from '../../middleware/authMiddleware'

const router: Router = Router()

router.use(fileUpload({}))

// POST /api/files/upload/
//
router.post(
  '/',
  body('filename').trim().isLength({ min: 3 }),
  body('projectId').trim().isLength({ min: 6 }),
  requireAuthenticated,
  validateResult,
  (req, res: express.Response<{}, UserRecord>) => {
    const { filename, projectId } = req.body

    if (
      typeof req.files === 'undefined' ||
      typeof req.files['file'] === 'undefined'
    )
      return res.status(400).json({ msg: 'No file was sent!' })

    // Binary data base64
    const uploadedFiles = req.files['file']
    const file: UploadedFile = Array.isArray(uploadedFiles)
      ? uploadedFiles[0]
      : uploadedFiles

    const fileContent = Buffer.from(file.data) // 'binary' option not working?

    // res status and json done inside of upload
    Media.uploadMedia(filename, fileContent, {
      fileType: file.mimetype,
      res,
      project: projectId,
      userId: res.locals.user?.id,
    })
  }
)

export default router
