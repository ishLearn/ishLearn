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
  const resultId = await newP.save(createdBy, req.body.users)
  return res.json({
    newP,
    id: resultId,
  })
})

// PUT /api/products/collaborator/:pid
// Add or remove a new collaborator to or from the database belonging to one project, in the `uploadBy`-table. Does not update the project's `createdBy`-field.
router.put(
  '/collaborator/:pid',
  async (req: express.Request, res: express.Response) => {
    const { newCollaboratorId, add } = req.body
    if (typeof add !== 'boolean')
      res
        .status(400)
        .json({ msg: 'Should the collaborator be added or removed?' })
    if (add) Product.addCollaborator(req.params.pid, newCollaboratorId)
    else Product.removeCollaborator(req.params.pid, newCollaboratorId)

    return res
      .status(200)
      .json({ msg: 'Successfully added/removed the collaborator' })
  }
)

// GET /api/products/:id ; where `typeof params.id === 'string'` (not a number!)
// Return the demanded product or an empty array if the product is not found.
router.get('/:id', async (req: express.Request, res: express.Response) => {
  return res.json(await Product.getFullProductById(req.params.id))
})

// POST /api/products/filter
// Search (filter) products following the body parameters, namely:
// - tags
// - query string (this searches the title) | TODO: Add search for description?
// - collaborators (ids)
router.post('/filter', async (req: express.Request, res: express.Response) => {
  const {
    tags,
    queryString,
    collaborators,
  }: { tags?: string[]; queryString?: string; collaborators?: string[] } =
    req.body

  const products = await Product.search(tags, queryString, collaborators)

  return res.json({ tags, products })
})

export default router
