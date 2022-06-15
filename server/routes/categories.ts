import express from 'express'
import { body } from 'express-validator'

import { validateResult } from './users'

import Category from '../models/Category'
import { UserRecord } from '../types/users'

const router = express.Router()

// GET /api/categories/search/:category/:tagnameBeginning
// Return the first {@link Tag.QUERY_LIMIT} results for the tag beginning
router.get(
  '/search/:category/:tagnameBeginning',
  async (req: express.Request, res: express.Response<{}, UserRecord>) => {
    return res.json(
      await Category.searchTagFromCat(
        req.params.category,
        req.params.tagnameBeginning
      )
    )
  }
)

// GET /api/categories/:category/
// Return the first {@link Tag.QUERY_LIMIT * 2} tags from the category
router.get(
  '/:category',
  async (req: express.Request, res: express.Response<{}, UserRecord>) => {
    return res.json(await Category.getTagsFromCategory(req.params.category))
  }
)

// POST /api/categories/
// Insert a link between tag and category to DB.
router.post(
  '/',
  body('tagname').trim().isLength({ min: 3 }),
  body('catname').trim().isLength({ min: 3 }),
  validateResult,
  async (req: express.Request, res: express.Response<{}, UserRecord>) => {
    const { tagname, catname } = req.body
    try {
      await Category.addTagAsCategoryValue(catname, tagname)
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

// DELETE /api/categories/
// Remove a link between category and tag
router.delete(
  '/',
  body('tagname').trim().isLength({ min: 3 }),
  body('catname').trim().isLength({ min: 3 }),
  validateResult,
  async (req: express.Request, res: express.Response<{}, UserRecord>) => {
    const { catname, tagname } = req.body
    try {
      await Category.removeTagFromCat(catname, tagname)
      return res.json({
        success: true,
      })
    } catch (err) {
      return res.status(400).json({
        err: 'The tag could not be deleted from category.',
      })
    }
  }
)

export default router
