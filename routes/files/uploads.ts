import { Router } from 'express'

const router: Router = Router()

router.post('/', (req, res) => {
  console.log('Return')
  res.status(200).json({
    success: true,
    message: 'Apparently working',
  })
})
