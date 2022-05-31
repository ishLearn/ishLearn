import { Router } from 'express'
import fileUpload, { UploadedFile } from 'express-fileupload'

import Media from '../../models/Media'

const router: Router = Router()

router.use(fileUpload)

// POST /api/files/upload/
//
router.post('/', (req, res) => {
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
  Media.uploadMedia(filename, projectId, fileContent, res)
})

export default router
