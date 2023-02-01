import express from 'express'
import { body } from 'express-validator'

import { validateResult } from './users'

import Product from '../models/Product'
import { UserRecord } from '../types/users'
import { NumberLike } from 'hashids/cjs/util'
import DBService, {
  getHashFromIntID,
  getIntIDFromHash,
  SupervisedByStatus,
} from '../services/DBService'
import {
  requireAuthenticated,
  requireAuthenticatedAsStudent,
  requireAuthenticatedAsTeacher,
} from '../middleware/authMiddleware'
import Logger from '../utils/Logger'

const router = express.Router()

// GET / FIND PRODUCTS

// GET /api/products/page/:page
// Get a list of the first fifty products that have a visibility of 'public'
router.get(
  '/page/:page',
  async (req: express.Request, res: express.Response<{}, UserRecord>) => {
    const page = Number(req.params.page) || 0
    return res.json(
      await Product.getFirstProducts({
        loggedInUser: res.locals.user,
        page,
      })
    )
  }
)

// GET /api/products/:id ; where `typeof params.id === 'string'` (not a number!)
// Return the demanded product or an empty array if the product is not found.
router.get(
  '/:id',
  async (req: express.Request, res: express.Response<{}, UserRecord>) => {
    try {
      return res
        .status(200)
        .json(await Product.getFullProductById(req.params.id, res.locals.user))
    } catch (err) {
      return res.status(400).json({
        error: 'Could not retrieve product. Is the ID invalid?',
      })
    }
  }
)

// GET /api/products/:id ; where `typeof params.id === 'string'` (not a number!)
// If the user has the permission to update this product
router.get(
  `/:pid/permission`,
  async (
    req: express.Request<{ pid: string }>,
    res: express.Response<{}, UserRecord>
  ) => {
    try {
      const result =
        res.locals.user?.id &&
        (await Product.hasPermission(req.params.pid, res.locals.user?.id))
          ? true
          : false

      return res.status(200).json({
        hasEditPermission: result,
      })
    } catch (err) {
      return res.status(400).json({
        error:
          'Permission could not be looked up, is the ID valid and the user logged in?',
      })
    }
  }
)

// POST /api/products/filter
// Search (filter) products following the body parameters, namely:
// - tags
// - query string (this searches the title) | TODO: Add search for description?
// - collaborators (ids)
router.post(
  '/filter',
  async (req: express.Request, res: express.Response<{}, UserRecord>) => {
    const {
      tags,
      queryString,
      collaborators,
    }: { tags?: string[]; queryString?: string; collaborators?: string[] } =
      req.body

    const products = await Product.search(tags, queryString, collaborators)

    return res.json({ tags, products })
  }
)

// ADD PRODUCT

// POST /api/products/
// Insert a new Product into the database, returns the given product information and the new product's id.
// body:
// - title: string,
// - visibility: Visibility (as string),
// - collaborators?: UserID[] // Potentially give the possibility to add other future contributors. This logged in user is already included and must not be specified again.
router.post(
  '/',
  requireAuthenticatedAsStudent,
  body('title').trim().isLength({ min: 3 }),
  body('visibility').isBoolean(),
  validateResult,
  async (
    req: express.Request<
      {},
      {},
      {
        title: string
        visibility: boolean
        collaborators?: string[]
        description: string
      }
    >,
    res: express.Response<{}, UserRecord>
  ) => {
    if (!res.locals.user?.id)
      return res.status(403).json({ error: 'Not authenticated' })
    const { title, visibility } = req.body

    const newP = new Product(
      title,
      visibility ? 'public' : 'private',
      res.locals.user.id,
      res.locals.user.id
    )
    try {
      const users: Array<string | number> = req.body.collaborators || []

      const resultId = await newP.save(res.locals.user.id, ...users)
      await Product.saveDescription(
        resultId,
        req.body.description,
        res.locals.user.id
      )

      return res.json({
        newP,
        id: getHashFromIntID(resultId),
      })
    } catch (err) {
      new Logger().error('Add new Product', 'Save to DB', err)
      return res.status(400).json({
        err: 'The product could not be saved. Are all fields filled out correctly?',
      })
    }
  }
)

// ADD / REMOVE collaborator

// PUT /api/products/collaborator/:pid
// Add or remove a new collaborator to or from the database belonging to one project, in the `uploadBy`-table. Does not update the project's `createdBy`-field.
router.put(
  '/collaborator/:pid',
  requireAuthenticated,
  body('newCollaboratorId').trim().isLength({ min: 6 }),
  body('add').isBoolean(),
  validateResult,
  async (req: express.Request, res: express.Response<{}, UserRecord>) => {
    const {
      newCollaboratorId,
      add,
    }: { newCollaboratorId: string; add?: boolean } = req.body
    if (typeof add !== 'boolean')
      return res
        .status(400)
        .json({ msg: 'Should the collaborator be added or removed?' })
    if (add) await Product.addCollaborator(req.params.pid, newCollaboratorId)
    else await Product.removeCollaborator(req.params.pid, newCollaboratorId)

    return res
      .status(200)
      .json({ msg: 'Successfully added/removed the collaborator' })
  }
)

// PUT /api/products/teacher/add/:pid
// Add a new teacher to the database belonging to one project, in the `supervisedBy`-table.
router.put(
  '/teacher/add/:pid',
  requireAuthenticated,
  body('teacherID').trim().isLength({ min: 6 }),
  validateResult,
  async (req: express.Request, res: express.Response<{}, UserRecord>) => {
    const { teacherID }: { teacherID: string } = req.body

    await Product.addTeacher(req.params.pid, teacherID)

    return res.status(200).json({ msg: 'Successfully added the teacher' })
  }
)

// PUT /api/products/update/status/:pid
// Add a new teacher to the database belonging to one project, in the `supervisedBy`-table.
router.put(
  '/update/status/:pid',
  requireAuthenticatedAsTeacher,
  body('status').trim().isLength({ min: 6 }),
  validateResult,
  async (req: express.Request, res: express.Response<{}, UserRecord>) => {
    const { status, grade }: { status: string; grade?: string } = req.body

    const teacherID = res.locals.user?.id
    if (typeof teacherID === 'undefined')
      return res.status(403).json({ error: 'Not authenticated as teacher' })

    const pid: NumberLike = getIntIDFromHash(req.params.pid)
    const tid: NumberLike = getIntIDFromHash(teacherID)

    let s: SupervisedByStatus | null = null
    if (status == SupervisedByStatus.GRADED) s = SupervisedByStatus.GRADED
    if (status == SupervisedByStatus.SUBMISSION_OPEN)
      s = SupervisedByStatus.SUBMISSION_OPEN
    if (status == SupervisedByStatus.SUBMISSION_CLOSED)
      s = SupervisedByStatus.SUBMISSION_CLOSED

    if (s === null) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    await Product.updateSupervisedStatus(pid, tid, s, grade)

    return res.status(200).json({ msg: 'Successfully updated the status.' })
  }
)

// Update DESCRIPTION

// PUT /api/products/:pid/description
// Update a product's description
router.put(
  '/:pid/description',
  requireAuthenticatedAsStudent,
  validateResult,
  async (
    req: express.Request<{ pid: string }, {}, { description: string }>,
    res: express.Response<{}, UserRecord>
  ) => {
    const productId = req.params.pid

    const collaborator = res.locals.user?.id
    if (!collaborator)
      return res.status(403).json({ error: 'Not authenticated' })

    try {
      await Product.saveDescription(
        getIntIDFromHash(productId),
        req.body.description,
        collaborator
      )

      return res.status(200).json({
        success: true,
        productId,
      })
    } catch (err: any) {
      return res.status(403).json({
        error: 'Benutzer hat keinen schreibenden Zugriff auf dieses Produkt.',
      })
    }
  }
)

// UPDATE TITLE / VISIBILITY

// PUT /api/products/:pid/
// Update a product's (id in param) title and/or visibility
router.put(
  '/:pid',
  requireAuthenticatedAsStudent,
  validateResult,
  async (
    req: express.Request<{ pid: string }>,
    res: express.Response<{}, UserRecord>
  ) => {
    const productId = req.params.pid

    const fieldsToUpdate: {
      title?: string
      visibility?: string
    } = req.body

    const collaborator = res.locals.user?.id
    if (!collaborator)
      return res.status(403).json({ error: 'Not authenticated' })

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
      if ('Visibility is not valid' === err.message) {
        new Logger().error(
          'Update Product',
          'Update title / visibility:    Invalid visibility   ',
          err
        )

        return res.status(400).json({
          error: 'Benutzer hat keine valide Sichtbarkeit ausgewählt.',
        })
      }

      return res.status(403).json({
        error: 'Benutzer hat keinen schreibenden Zugriff auf dieses Produkt.',
      })
    }
  }
)

// ADD / REMOVE TAGS

// PUT /api/products/:id/tags
router.put(
  '/:id/tags',
  requireAuthenticated,
  body('tags').isArray(),
  body('add').isBoolean(),
  validateResult,
  async (
    req: express.Request<{ id: string }>,
    res: express.Response<{}, UserRecord>
  ) => {
    const { tags, add }: { tags: string[]; add: boolean } = req.body
    const productId: string = req.params.id

    const collaborator = res.locals.user?.id
    if (!collaborator)
      return res.status(403).json({ error: 'Not authenticated' })

    if (typeof add !== 'boolean')
      return res
        .status(400)
        .json({ msg: 'Should the tags be added or removed?' })

    await Product.updateTags(productId, collaborator, tags, add)
    return res.status(200).json({
      success: true,
      productId,
    })
  }
)

// REMEMBER PRODUCT
// POST /api/products/remember/:id
// Remember a product
router.post(
  '/remember/:pid',
  requireAuthenticated,
  body('add').isBoolean(),
  async (
    req: express.Request<{ pid: string }, {}, { add: boolean }>,
    res: express.Response<{}, UserRecord>
  ) => {
    const productId = req.params.pid
    const userId = res.locals.user?.id
    if (!userId)
      return res
        .status(403)
        .json({ error: 'Must be logged in to change remembered products.' })

    if (req.body.add) await Product.remember(productId, userId)
    else await Product.doNotRemember(productId, userId)

    return res.status(200).json({
      success: true,
      msg: `Successfully ${
        req.body.add ? 'added project to' : 'removed project from'
      } remembered list.`,
    })
  }
)

// ADD / REMOVE MEDIA

// POST /api/products/:id/media
// Should this route be exposed
// Add a new media to product (id as param)
router.post(
  '/:id/media',
  requireAuthenticated,
  body('mediaId').trim().isLength({ min: 6 }),
  body('add').isBoolean(),
  validateResult,
  async (
    req: express.Request<{ id: string }, {}, { mediaId: string; add: boolean }>,
    res: express.Response<{}, UserRecord>
  ) => {
    const productId: string = req.params.id
    const { mediaId, add } = req.body
    if (add)
      return res.status(400).json({
        msg: 'Cannot blindly add media, will automatically be linked with product when upload is successful.',
      })

    const collaborator = res.locals.user?.id
    if (!collaborator)
      return res.status(403).json({ error: 'Not authenticated' })

    if (typeof add !== 'boolean')
      return res
        .status(400)
        .json({ msg: 'Should the media be added or removed?' })

    const result = (
      add
        ? await Product.addMedia(productId, collaborator, mediaId)
        : await Product.removeMedia(productId, collaborator, mediaId)
    )[0]?.results
    return res.status(200).json({
      success: true,
      productId,
      affectedRows: result?.affectedRows,
    })
  }
)

router.get('/:id/media', async (req, res) => {
  try {
    return res
      .status(200)
      .json({ media: await Product.getAllMedia(req.params.id) })
  } catch (err) {
    return res
      .status(400)
      .json({ error: 'Media for product could not be retrieved' })
  }
})

router.post(
  '/:pid/media/delete',
  requireAuthenticatedAsStudent,
  async (
    req: express.Request<{ pid: string }, {}, { filename?: string }>,
    res: express.Response<{}, UserRecord>
  ) => {
    if (!req.body.filename)
      return res.status(400).json({ error: 'Filename was not defined' })
    if (!res.locals.user?.id)
      return res.status(403).json({ error: 'User not authenticated' })

    try {
      Product.removeMediaByFilename(
        req.params.pid,
        req.body.filename,
        res.locals.user.id
      )

      return res
        .status(200)
        .json({ msg: `Successfully removed media ${req.body.filename}` })
    } catch (err) {
      new Logger().error(
        `Media`,
        `Remove media ${req.params.pid}:${req.body.filename}`,
        err
      )
      return res.status(400).json({ error: 'Could not remove media.' })
    }
  }
)

export default router
