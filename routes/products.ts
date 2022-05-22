import express from 'express'
import { body, validationResult } from 'express-validator'
import Product from '../models/Product'

const router = express.Router()

// GET /api/products/
// Get a list of the first fifty products
router.get('/', async (req: express.Request, res: express.Response) => {
  return res.json(await Product.getFirstProducts())
})

// POST /api/products/
// Insert a new Product into the database, returns the given product information and the new product's id.
router.post('/', async (req: express.Request, res: express.Response) => {
  const { title, visibility, updatedBy, createdBy } = req.body
  const newP = new Product(title, visibility, updatedBy, createdBy)
  const resultId = await newP.save()
  return res.json({
    newP,
    id: resultId,
  })
})

// GET /api/products/:id ; where `typeof params.id === 'string'` (not a number!)
// Return the demanded product or an empty array if the product is not found.
router.get('/:id', async (req: express.Request, res: express.Response) => {
  return res.json(await Product.getFullProductById(req.params.id))
})

export default router
