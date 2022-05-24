import express from 'express'
import { body, validationResult } from 'express-validator'
import Product from '../models/Product'

const router = express.Router()

// GET / FIND PRODUCTS

// GET /api/products/
// Get a list of the first fifty products that have a visibility of 'public'
// TODO: Setup pagination
router.get('/', async (req: express.Request, res: express.Response) => {
  return res.json(await Product.getFirstProducts())
})

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

// ADD PRODUCT

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

// ADD / REMOVE collaborator

// PUT /api/products/collaborator/:pid
// Add or remove a new collaborator to or from the database belonging to one project, in the `uploadBy`-table. Does not update the project's `createdBy`-field.
router.put(
  '/collaborator/:pid',
  async (req: express.Request, res: express.Response) => {
    const {
      newCollaboratorId,
      add,
    }: { newCollaboratorId: string; add?: boolean } = req.body
    if (typeof add !== 'boolean')
      return res
        .status(400)
        .json({ msg: 'Should the collaborator be added or removed?' })
    if (add) Product.addCollaborator(req.params.pid, newCollaboratorId)
    else Product.removeCollaborator(req.params.pid, newCollaboratorId)

    return res
      .status(200)
      .json({ msg: 'Successfully added/removed the collaborator' })
  }
)

// UPDATE TITLE / VISIBILITY

// PUT /api/products/:pid/
// Update a product's (id in param) title and/or visibility
router.put('/:pid', async (req, res) => {
  const productId = req.params.pid

  const {
    collaborator,
    fieldsToUpdate,
  }: {
    collaborator: string
    fieldsToUpdate: {
      title?: string
      visibility?: string
    }
  } = req.body

  try {
    const result: any = (
      await Product.update(productId, collaborator, fieldsToUpdate)
    ).results

    return res.status(200).json({
      success: true,
      productId,
      affectedRows: result.affectedRows, // result.affectedRows
    })
  } catch (err: any) {
    if ('Visibility is not valid' === err.message)
      return res.status(400).json({
        msg: 'Benutzer hat keine valide Sichtbarkeit ausgewählt.',
      })
    return res.status(403).json({
      msg: 'Benutzer hat keinen schreibenden Zugriff auf dieses Produkt.',
    })
  }
})

// ADD / REMOVE TAGS

// PUT /api/products/:id/tags
router.put('/:id/tags', async (req, res) => {
  const {
    tags,
    collaboratorId,
    add,
  }: { tags: string[]; collaboratorId: string; add: boolean } = req.body
  const productId: string = req.params.id

  if (typeof add !== 'boolean')
    return res
      .status(400)
      .json({ msg: 'Should the collaborator be added or removed?' })

  await Product.updateTags(productId, collaboratorId, tags, add)
  return res.status(200).json({
    success: true,
    productId,
  })
})

// ADD / REMOVE MEDIA

// POST /api/products/:id/media
// Add a new media to product (id as param)
router.post('/:id/media', async (req, res) => {
  const productId: string = req.params.id
  const {
    collaboratorId,
    mediaId,
    add,
  }: { collaboratorId: string; mediaId: string; add: boolean } = req.body

  if (typeof add !== 'boolean')
    return res
      .status(400)
      .json({ msg: 'Should the collaborator be added or removed?' })

  const result = (
    add
      ? await Product.addMedia(productId, collaboratorId, mediaId)
      : await Product.removeMedia(productId, collaboratorId, mediaId)
  ).results
  return res.status(200).json({
    success: true,
    productId,
    affectedRows: result.affectedRows,
  })
})

export default router
