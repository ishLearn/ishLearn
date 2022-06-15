import express from 'express'
import { body } from 'express-validator'

import { validateResult } from './users'

import Product from '../models/Product'
import { UserRecord } from '../types/users'
import Tag from '../models/Tag'

const router = express.Router()

// GET / FIND TAGS

// GET /api/tags/page/:page
// Get a list of the first {@link Tag.QUERY_LIMIT} tags that have a visibility of 'public'
router.get(
  '/page/:page',
  async (req: express.Request, res: express.Response<{}, UserRecord>) => {
    const page = Number(req.params.page) || 0
    return res.json(await Tag.getTags(page))
  }
)

// GET /api/tags/:id ; where `typeof params.id === 'string'` (not a number!)
// Return the demanded product or an empty array if the product is not found.
router.get(
  '/:tagname',
  async (req: express.Request, res: express.Response<{}, UserRecord>) => {
    return res.json(await Tag.getTagByTagname(req.params.tagname))
  }
)

// GET /api/tags/search/:tagnameBeginning
// Return the first {@link Tag.QUERY_LIMIT} results for the tag beginning
router.get(
  '/search/:tagnameBeginning',
  body('tagname').trim().isLength({ min: 2 }),
  validateResult,
  async (req: express.Request, res: express.Response<{}, UserRecord>) => {
    return res.json(await Tag.search(req.params.tagnameBeginning))
  }
)

// ADD PRODUCT

// POST /api/tags/
// Insert a new Product into the database, returns the given product information and the new product's id.
router.post(
  '/',
  body('tagname').trim().isLength({ min: 3 }),
  validateResult,
  async (req: express.Request, res: express.Response<{}, UserRecord>) => {
    const { tagname } = req.body
    try {
      await Tag.save(tagname)
      return res.json({
        success: true,
      })
    } catch (err) {
      return res.status(400).json({
        err: 'The tag could not be saved. Was the tagname correctly sent and does not it exist already?',
      })
    }
  }
)

router.delete(
  '/',
  body('tagname').trim().isLength({ min: 3 }),
  validateResult,
  async (req: express.Request, res: express.Response<{}, UserRecord>) => {
    const { tagname } = req.body
    try {
      await Tag.delete(tagname)
      return res.json({
        success: true,
      })
    } catch (err) {
      return res.status(400).json({
        err: 'The tag could not be saved. Was the tagname correctly sent and does not it exist already?',
      })
    }
  }
)

export default router
