import express, { Router } from 'express'
import fileUpload, { UploadedFile } from 'express-fileupload'
import { body } from 'express-validator'

import { validateResult } from '../users'

import Media from '../../models/Media'
import { UserRecord } from '../../types/users'

const router: Router = Router()

router.use(fileUpload)

// POST /api/files/upload/
//
router.post(
  '/',
  body('filename').trim().isLength({ min: 3 }),
  body('projectId').trim().isLength({ min: 6 }),
  validateResult,
  (req, res: express.Response<{}, UserRecord>) => {
    const { filename, projectId } = req.body

    if (
      typeof req.files === 'undefined' ||
      typeof req.files[filename] === 'undefined'
    )
      return res.status(400).json({ msg: 'No file was sent!' })

    // Binary data base64
    const uploadedFiles = req.files[filename]
    let file: UploadedFile
    if (Array.isArray(uploadedFiles)) file = uploadedFiles[0]
    else file = uploadedFiles
    const fileContent = Buffer.from(file.data) // 'binary' option not working?

    // res status and json done inside of upload
    Media.uploadMedia(filename, fileContent, {
      res,
      project: projectId,
    })
  }
)

export default router
