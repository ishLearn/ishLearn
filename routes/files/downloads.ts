import { Router } from 'express'

import Media from '../../models/Media'

const router: Router = Router()

// POST /api/files/download/
// Get a file from S3. Filename includes the whole path
router.post('/', async (req, res) => {
  const { filename } = req.body

  // res status and json done inside of upload
  await Media.downloadMedia(filename, res)
})

export default router
