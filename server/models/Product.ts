import DBService, {
  getHashFromIntID,
  getIntIDFromHash,
  SupervisedByStatus,
  Visibility,
} from '../services/DBService'

import { NumberLike } from 'hashids/cjs/util'
import { ID } from '../types/ids'

// User model import
import User from './User'
// RedisService import
import {
  addProduct,
  getValue,
  setValue,
  searchProductById,
} from '../services/RedisService'
import Media, { MediaPartOfProduct, MediaPartOfProductJoin } from './Media'
import { rejects } from 'assert'

/**
 * A Product is a unit of files, comments and other content and information.
 * It's Primary Key is a AUTO-INCREMENT INT ID, for the Frontend
 * hashed with the {@link https://www.npmjs.com/package/hashids hashids} package.
 *
 * @see {@link Product["id"]}
 * @author @SebastianThomas
 */
export default class Product {
  id?: ID
  title: string
  visibility: Visibility | string
  updatedBy: number | string
  createdBy: number | string
  createDate?: Date
  updatedDate?: Date
  avgRating?: number | string

  static QUERY_LIMIT = '50'

  static normalQuery = `SELECT ?? FROM products AS products WHERE products.visibility = "public"`
  static adminQuery = `SELECT ?? FROM products AS products`
  static studentQuery = `SELECT ?? FROM products LEFT JOIN uploadBy ON products.ID = uploadBy.PID WHERE (products.visibility = "public" AND if(uploadBy.UID IS NULL, TRUE, products.createdBy = uploadBy.UID) OR uploadBy.UID = ?)`
  static teachersQuery = `SELECT ?? FROM products LEFT JOIN supervisedBy ON products.ID = supervisedBy.PID (WHERE products.visibility = "public" OR supervisedBy.TID = ?)`

  /**
   * Create a Product based on
   * @param title the title of the Product
   * @param visibility the visibility status of the Product
   * @param createDate the date of creation
   * @param updatedDate the date of last modification
   * @param updatedBy the id of the User who has last updated the product
   * @param id the ID of the product. Optional: Will be auto generated (AUTO_INCREMENT) if not specified
   */
  constructor(
    title: string,
    visibility: Visibility | string,
    updatedBy: NumberLike | string,
    createdBy: NumberLike | string,
    createDate?: Date,
    updatedDate?: Date,
    id?: ID | NumberLike,
    avgRating?: number | string
  ) {
    this.title = title
    this.visibility = visibility
    this.createDate = createDate
    this.updatedDate = updatedDate
    this.updatedBy =
      typeof updatedBy === 'string' || typeof updatedBy === 'undefined'
        ? updatedBy
        : getHashFromIntID(updatedBy)
    this.createdBy =
      typeof createdBy === 'string' || typeof createdBy === 'undefined'
        ? createdBy
        : getHashFromIntID(createdBy)
    this.id =
      typeof id === 'string' || typeof id === 'undefined'
        ? id
        : getHashFromIntID(id)
    this.avgRating = avgRating
  }

  /**
   * Map all ids from a product result (from DB) to HashIDs
   * @param result the DB query's result
   * @returns The result. with hashed ids
   */
  static mapResultsToHash(result: {
    id?: NumberLike | string
    ID?: NumberLike | string
    title: string
    visibility: Visibility | string
    updatedBy: NumberLike | string
    createdBy: NumberLike | string
    createDate?: Date
    updatedDate?: Date
    avgRating?: number | string
  }) {
    const id = result.id ? result.id : result.ID
    return new Product(
      result.title,
      result.visibility,
      result.updatedBy,
      result.createdBy,
      result.createDate,
      result.updatedDate,
      id,
      result.avgRating
    )
  }

  /**
   * Retrieve the specified fields from a Product from the DB, and return it.
   *
   * @param idInput The ID to search for. Can be provided as either number (search for the exact number ID in the DB) or string (search for the decoded ID in the DB).
   * @param fields The fields (columns) to retrieve
   * @returns The found Product in the DB
   * @throws Error if the Product is not found
   */
  static async getProductById(
    idInput: number | string,
    fields: string[],
    loggedInUser?: User
  ): Promise<Product> {
    const foundProduct = await searchProductById(
      typeof idInput === 'string' ? idInput : getHashFromIntID(idInput)
    )

    if (foundProduct?.ID) {
      let { ID } = foundProduct
      if (
        typeof ID !== 'undefined' &&
        ID !== null &&
        foundProduct.visibility === 'public'
      ) {
        if (typeof ID === 'number') ID = getHashFromIntID(ID)

        // Resolve with redis hit
        return Product.mapResultsToHash({ id: ID, ...foundProduct })
      }
    }

    // Query
    const id = typeof idInput === 'string' ? getIntIDFromHash(idInput) : idInput
    const query =
      (typeof loggedInUser === 'undefined'
        ? Product.normalQuery
        : loggedInUser.rank === 'student'
        ? Product.studentQuery
        : loggedInUser.rank === 'admin'
        ? Product.adminQuery
        : Product.teachersQuery) + ` AND ID = ? LIMIT 1` // LIMIT 1 so no further filtering required (to cross out double products)

    // Parameters
    const params: any[] = [fields]
    if (loggedInUser?.id) params.push(getIntIDFromHash(loggedInUser.id))
    params.push(id)

    // console.log(query)
    // console.log(params)

    // Send query and await response
    const result = (await new DBService().query(query, params)).results

    // Return
    await Promise.all(
      result.map(async (product: Product): Promise<void> => {
        if (!product.id) return
        product.avgRating = await Product.getAvgRating(product.id)
      })
    )

    const productResult = result.map(Product.mapResultsToHash)

    // productResult is an array, which should only contain one product
    addProduct(productResult[0])
    return productResult
  }

  /**
   * Retrieve the specified fields from a Product from the DB, and return it.
   *
   * @param tags The tags to search for.
   * @param queryString The query string to search for in the title
   * @param collaborators The collaborator IDs to search for
   * @returns The found Product in the DB
   */
  static async search(
    tags?: string[],
    queryString?: string,
    collaborators?: string[]
  ): Promise<Product[]> {
    const conditionQuery: string = queryString || ''
    const collaboratorNumberIds: NumberLike[] =
      collaborators?.map(v => getIntIDFromHash(v)) || []
    const tagValues: string[] = tags || []

    const cIdsExist = collaboratorNumberIds.length > 0
    const tagVExist = tagValues.length > 0

    // Build query, based on cIdsExist and tagVExist
    const query = `
          SELECT ID, title, visibility, createDate, updatedDate, createdBy, updatedBy FROM products 
           ${
             cIdsExist
               ? `LEFT JOIN (SELECT PID, UID FROM uploadBy WHERE UID IN (?)) AS ub ON (products.ID = ub.PID) `
               : ''
           }
          ${
            tagVExist
              ? `LEFT JOIN (SELECT tag, PID FROM pt WHERE tag IN ?) AS pt ON (products.ID = pt.PID)`
              : ''
          } WHERE visibility = "public" AND title REGEXP ?
          GROUP BY products.ID ${
            tagVExist || cIdsExist
              ? `HAVING ${tagVExist ? `COUNT(pt.tag) = ? ` : ''}${
                  tagVExist && cIdsExist ? 'AND' : ''
                } ${cIdsExist ? `COUNT(ub.UID) = ?` : ''}
            `
              : ''
          } LIMIT 50
        `
      .replace(/\s/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .replace(/\( /g, '(')
    // Format the query not to include too many whitespace characters

    // Set SQL Query Params
    const params: Array<string | NumberLike[] | string[] | number> = []

    if (collaboratorNumberIds.length > 0) params.push(collaboratorNumberIds)
    if (tagValues.length > 0) params.push(tagValues)
    params.push(conditionQuery)
    if (tagVExist) params.push(tagValues.length)
    if (cIdsExist) params.push(collaboratorNumberIds.length)

    const dbresult = await new DBService().query(query, params)
    // Send Query and return result
    const results: Product[] = (
      await new DBService().query(query, params)
    ).results.map(Product.mapResultsToHash)

    return results
  }

  /**
   * Retrieve a Product from the DB, and return it.
   * Retrieved fields:
   * - title
   * - visibility
   * - create date
   * - updated date
   * - updated by
   *
   * @param id The ID to search for
   * @returns The found Product in the DB
   * @throws Error if the Product is not found
   */
  static async getFullProductById(
    id: number | string,
    loggedInUser?: User
  ): Promise<Product> {
    const r = await Product.getProductById(
      id,
      [
        'title',
        'visibility',
        'createDate',
        'updatedDate',
        'updatedBy',
        'createdBy',
        'id',
      ],
      loggedInUser
    )
    return r
  }

  /**
   * Find some products from the DB.
   * @returns the 20 first products from the DB
   */
  static async getFirstProducts(config: {
    loggedInUser?: User
    page?: number
  }): Promise<Product[]> {
    config.page = config.page || 0

    const query =
      (typeof config.loggedInUser === 'undefined'
        ? Product.normalQuery
        : config.loggedInUser.rank === 'student'
        ? Product.studentQuery
        : config.loggedInUser.rank === 'admin'
        ? Product.adminQuery
        : Product.teachersQuery) +
      ' LIMIT 20 OFFSET ' +
      config.page * 20

    const res = await new DBService().query(query, [
      [
        'products.ID',
        'products.title',
        'products.visibility',
        'products.createDate',
        'products.updatedDate',
        'products.updatedBy',
        'products.createdBy',
      ],
      config.loggedInUser?.id && getIntIDFromHash(config.loggedInUser.id),
    ])

    const { results } = res

    const resultProducts = results.map(
      (line: {
        ID: number
        title: string
        visibility: string
        createdDate: Date
        updatedDate: Date
        createdBy: number
        updatedBy: number
      }) => {
        return new Product(
          line.title,
          line.visibility,
          line.updatedBy,
          line.createdBy,
          line.createdDate,
          line.updatedDate,
          line.ID
        )
      }
    ) as Product[]

    // Filter products to be unique, instead of potential doubles through JOIN with teachers table ((multiple teachers -> one product) => (multiple entries in result).filter())
    const productIds: string[] = []
    return resultProducts.filter(product => {
      if (typeof product.id === 'undefined') return false
      if (productIds.includes(product.id)) return false
      productIds.push(product.id)
      return true
    })
  }

  static async getAvgRating(id: string | number) {
    const pid = typeof id === 'string' ? getIntIDFromHash(id) : id

    const redisRating = await getValue(`rating-${id}`)

    // Return either rating from Redis or fetch from DB
    if (redisRating) return redisRating

    const result = (
      await new DBService().query(
        `SELECT avg(rating) FROM comments WHERE PID = ? GROUP BY PID`,
        [pid]
      )
    ).results[0]
    const res =
      typeof result !== 'undefined' && result !== null
        ? (result['avg(rating)'] as number)
        : 0

    await setValue(`rating-${id}`, String(res))

    return res
  }

  static async getAllMedia(pid: string) {
    // With products join
    // const sql = `SELECT * FROM mediaPartOfProduct INNER JOIN media ON media.ID = mediaPartOfProduct.MID INNER JOIN products ON products.ID = mediaPartOfProduct.PID HAVING mediaPartOfProduct.PID = ?`
    // Without Products join
    const sql = `SELECT * FROM mediaPartOfProduct INNER JOIN media ON media.ID = mediaPartOfProduct.MID HAVING mediaPartOfProduct.PID = ?`
    const result = await new DBService().query(sql, [getIntIDFromHash(pid)])
    const media = (result.results as MediaPartOfProduct[]).map(
      (media: MediaPartOfProduct) => ({
        filename: media.filename,
        url: media.URL,
        fileType: media.filetype,
      })
    )

    return media
  }

  /**
   * Find out whether a user has update permission on this product.
   * @param pid Project ID to check for
   * @param uid User that is logged in
   * @param projectCreator Creator of the project, if used and uid equals projectCreator, no DB query is needed
   * @returns `true` if the user has update permission, otherwise `false`
   */
  static async hasPermission(
    pid: string,
    uid: string,
    projectCreator?: string
  ) {
    return (
      projectCreator === uid ||
      (
        await new DBService().query(
          `SELECT * FROM uploadBy WHERE PID = ? AND UID = ?`,
          [getIntIDFromHash(pid), getIntIDFromHash(uid)]
        )
      ).results?.length > 0
    )
  }

  // UPDATE / ADD Product

  /**
   * Save a description to a product.
   * @param pid Product ID
   * @param description Description text (md)
   * @param userId User ID (uploader / updater)
   */
  static async saveDescription(
    pid: NumberLike,
    description: string,
    userId: string
  ) {
    const result = await Media.uploadMedia(
      `description.md`,
      Buffer.from(description),
      {
        project: getHashFromIntID(pid),
        userId,
        fileType: 'text/markdown',
      }
    )

    if (typeof result === 'undefined' || !('worked' in result))
      throw new Error(
        'The upload has finished but not succeeded! Internal Server Error'
      )

    await Media.save(
      `description.md`,
      result.filePathName,
      'text/markdown',
      pid,
      userId
    )
  }

  /**
   * Save the product to the database. Does not update `this` product.
   * @param users the user's IDs
   * @returns The new Product's id
   */
  async save(...users: Array<number | string>): Promise<number> {
    if (typeof this.id !== 'undefined')
      throw new Error('Product has already been saved')

    let usersNrs: Array<number | NumberLike>
    usersNrs = users.map(user => {
      if (typeof user === 'string') return getIntIDFromHash(user)
      return user
    })

    if (usersNrs.length < 1)
      throw new Error(
        'There must be at least one user to administrate this product.'
      )

    try {
      const createdBy: NumberLike =
        typeof this.createdBy === 'string'
          ? getIntIDFromHash(this.createdBy)
          : this.createdBy
      const updatedBy: NumberLike =
        typeof this.updatedBy === 'string'
          ? getIntIDFromHash(this.updatedBy)
          : this.updatedBy

      const res = await new DBService().query(
        `INSERT INTO products (title, visibility, updatedBy, createdBy) VALUES (?)`,
        [[this.title, this.visibility, updatedBy, createdBy]]
      )

      const resUploadBy = await new DBService().query(
        `INSERT INTO uploadBy (PID, UID) VALUES (?)`,
        usersNrs.map((user: number | NumberLike) => [
          res.results.insertId,
          user,
        ])
      )

      this.id = res.results.insertId

      return res.results.insertId
    } catch (err) {
      console.log(err)
      return 0
    }
  }

  /**
   * Delete a product from the database.
   *
   * @param pid The product ID to delete
   * @param uid The user ID to check permission
   * @returns whether the DB query was successful AND has updated at least one row
   */
  static async delete(pid: string, uid: ID): Promise<boolean> {
    if (typeof uid !== 'string' || !(await Product.hasPermission(pid, uid)))
      return false

    const res = await new DBService().query(
      `DELETE FROM products WHERE ID = ?`,
      [getIntIDFromHash(pid)]
    )

    return res.results.affectedRows > 0
  }

  // UPDATE PRODUCT

  /**
   * Add a collaborator from to project. Updates the `uploadBy`-table.
   * @param pid Project ID (as string)
   * @param uid Collaborator to add to Project (as string)
   * @returns The results of the query
   */
  static async addCollaborator(pid: string, uid: string) {
    const productId = getIntIDFromHash(pid)
    const userId = getIntIDFromHash(uid)

    await Product.requireUserCanWrite(productId, userId)

    const resUploadBy = await new DBService().query(
      `INSERT INTO uploadBy (PID, UID) VALUES (?)`,
      [[productId, userId]]
    )

    return resUploadBy.results
  }

  /**
   * Add a Supervisor (teacher) from to project. Updates the `supervisedBy`-table.
   * @param pid Project ID (as string)
   * @param tid Teacher's ID to add to Project (as string)
   * @returns The results of the query
   */
  static async addTeacher(pid: string, tid: string) {
    const productId = getIntIDFromHash(pid)
    const userId = getIntIDFromHash(tid)

    await Product.requireUserCanWrite(productId, userId)

    const resSupervisedBy = await new DBService().query(
      `INSERT INTO supervisedBy (PID, TID, status) VALUES (?)`,
      [[productId, userId, SupervisedByStatus.SUBMISSION_OPEN]]
    )

    return resSupervisedBy.results
  }

  /**
   * Remove a collaborator from the project. Does not change the project's `createdBy`-field, only the `uploadBy`-table.
   * @param pid Project ID (as string)
   * @param uid Collaborator to remove from Project (as string)
   * @returns The results of the query
   */
  static async removeCollaborator(pid: string, uid: string) {
    const productId = getIntIDFromHash(pid)
    const userId = getIntIDFromHash(uid)

    await Product.requireUserCanWrite(productId, userId)

    const resUploadBy = await new DBService().query(
      `DELETE FROM uploadBy WHERE PID = ? AND UID = ?`,
      [productId, userId]
    )

    return resUploadBy.results
  }

  /**
   * Update the last modified time and user for a product.
   * @param productId Product ID that has been modified
   * @param userId User ID that modified the product
   * @returns Nothing
   */
  static async setLastModified(productId: NumberLike, userId: NumberLike) {
    await Product.requireUserCanWrite(productId, userId)

    return (
      await new DBService().query(
        `UPDATE products SET updatedBy = ? WHERE ID = ?`,
        [userId, productId]
      )
    ).results
  }

  /**
   * Teacher updates the supervised by status.
   * @param productId Product to update
   * @param teacherId Teacher that updated the status
   * @param status Status of the product
   * @param grade Grade to apply, is optional
   * @returns Nothing
   */
  static async updateSupervisedStatus(
    productId: NumberLike,
    teacherId: NumberLike,
    status: SupervisedByStatus,
    grade?: string
  ) {
    await Product.requireTeacherCanUpdate(productId, teacherId)

    return (
      await new DBService().query(
        `UPDATE supervisedBy SET status = ?, grade = ? WHERE PID = ? AND TID = ?`,
        [status, grade, productId, teacherId]
      )
    ).results
  }

  /**
   * Update the visibility or the title of a product.
   * @param productId the hashed product ID
   * @param collaboratorId the hashed user ID
   * @param fieldsToUpdate the fields to update; may contain title and visibility, but both can be undefined
   */
  static async update(
    productId: string,
    collaboratorId: string,
    fieldsToUpdate: {
      title?: string
      visibility?: string
    }
  ) {
    if (
      typeof fieldsToUpdate.visibility !== 'undefined' &&
      Object.values(Visibility).filter(v => v === fieldsToUpdate.visibility)
        .length < 1
    )
      throw new Error('Visibility is not valid')

    const pid = getIntIDFromHash(productId)
    const cid = getIntIDFromHash(collaboratorId)

    // Require user can write to the product
    await Product.requireUserCanWrite(pid, cid)

    const setTitle = typeof fieldsToUpdate.title !== 'undefined'
    const setVis = typeof fieldsToUpdate.visibility !== 'undefined'
    const query = `UPDATE products SET ${setTitle ? `title = ?` : ''}${
      setTitle && setVis ? ', ' : ''
    }${setVis ? `visibility = ?` : ''} WHERE ID = ?`

    const params = []

    if (setTitle) params.push(fieldsToUpdate.title)
    if (setVis) params.push(fieldsToUpdate.visibility)
    params.push(pid)

    return await new DBService().query(query, params)
  }

  /**
   * Update tags for the product.
   * @param productId the hashed product id
   * @param collaboratorId the hashed collaborator
   * @param tags the tags to add or remove, should always be an array of strings
   * @param add whether to add or to remove the tags
   * @returns Nothing
   */
  static async updateTags(
    productId: string,
    collaboratorId: string,
    tags: string[],
    add: boolean
  ) {
    const pid = getIntIDFromHash(productId)
    const cid = getIntIDFromHash(collaboratorId)
    await Product.requireUserCanWrite(pid, cid)

    return add
      ? await this.addTags(pid, cid, tags)
      : await this.removeTags(pid, cid, tags)
  }

  /**
   * Update: Add tags for the product.
   * @param pid the unhashed product id
   * @param cid the unhashed collaborator id
   * @param tags the tags to add, should always be an array of strings
   * @returns an array of all Promise results
   */
  static async addTags(pid: NumberLike, cid: NumberLike, tags: string[]) {
    await Product.requireUserCanWrite(pid, cid)

    const query = 'INSERT INTO productHasTag (PID, tag) VALUES (?, ?)'
    return await Promise.all([
      ...tags.map(async tag => {
        return await new DBService().query(query, [pid, tag])
      }),
      async () => {
        return await Product.setLastModified(pid, cid)
      },
    ])
  }

  /**
   * Update: Remove tags for the product.
   * @param pid the unhashed product id
   * @param cid the unhashed collaborator id
   * @param tags the tags to remove, should always be an array of strings
   * @returns an array of all Promise results
   */
  static async removeTags(pid: NumberLike, cid: NumberLike, tags: string[]) {
    await Product.requireUserCanWrite(pid, cid)

    const query = 'DELETE FROM productHasTag WHERE PID = ? AND tag = ?'
    return await Promise.all([
      ...tags.map(async tag => {
        return await new DBService().query(query, [pid, tag])
      }),
      async () => {
        return await Product.setLastModified(pid, cid)
      },
    ])
  }

  /**
   * Remember a project (add to Table: `rememberProject`)
   *
   * Issue #77
   * @param productId Project to link
   * @param userId User to link
   * @returns Nothing
   */
  static async remember(productId: string, userId: string): Promise<any> {
    const pid = getIntIDFromHash(productId)
    const uid = getIntIDFromHash(userId)

    return (
      await new DBService().query(
        `INSERT INTO rememberProject (PID, SID) VALUES (?, ?)`,
        [pid, uid]
      )
    ).results
  }

  /**
   * Do not remember a project (remove from Table: `rememberProject`)
   *
   * Issue #77
   * @param productId Project to link
   * @param userId User to link
   * @returns Nothing
   */
  static async doNotRemember(productId: string, userId: string): Promise<any> {
    const pid = getIntIDFromHash(productId)
    const uid = getIntIDFromHash(userId)

    return (
      await new DBService().query(
        `DELETE FROM rememberProject WHERE PID = ? AND SID = ?`,
        [pid, uid]
      )
    ).results
  }

  /**
   * Update: Add an existing media to the product
   * @param productId the hashed product id
   * @param collaboratorId the hashed collaborator id
   * @param mediaId the hashed media id to add
   * @returns an array of all Promise results
   */
  static async addMedia(
    productId: string | NumberLike,
    collaboratorId: string | NumberLike,
    mediaId: string | NumberLike
  ) {
    const pid =
      typeof productId === 'string' ? getIntIDFromHash(productId) : productId
    const cid =
      typeof collaboratorId === 'string'
        ? getIntIDFromHash(collaboratorId)
        : collaboratorId
    const mid =
      typeof mediaId === 'string' ? getIntIDFromHash(mediaId) : mediaId

    await Product.requireUserCanWrite(pid, cid)

    const result = [
      await new DBService().query(
        'INSERT INTO mediaPartOfProduct SET PID = ?, MID = ?',
        [pid, mid]
      ),
    ]

    result.push(await Product.setLastModified(pid, cid))

    return result
  }

  /**
   * Update: Add an existing media to the product
   * @param productId the hashed product id
   * @param collaboratorId the hashed collaborator id
   * @param mediaId the hashed media id to delete
   * @returns an array of all Promise results
   */
  static async removeMedia(
    productId: string,
    collaboratorId: string,
    mediaId: string | NumberLike
  ) {
    const pid = getIntIDFromHash(productId)
    const cid = getIntIDFromHash(collaboratorId)
    const mid =
      typeof mediaId === 'string' ? getIntIDFromHash(mediaId) : mediaId

    await Product.requireUserCanWrite(pid, cid)

    const result = [
      await new DBService().query(
        'DELETE FROM mediaPartOfProduct WHERE PID = ? AND MID = ?',
        [pid, mid]
      ),
    ]

    result.push(await Product.setLastModified(pid, cid))

    return result
  }

  /**
   * Update: Add an existing media to the product
   * @param productId the hashed product id
   * @param filename the filename to delete
   * @param collaboratorId the hashed collaborator id
   * @returns an array of all Promise results
   * @throws Error if the media is not found or the media could not be removed
   */
  static async removeMediaByFilename(
    productId: string,
    filename: string,
    collaboratorId: string
  ) {
    try {
      const mid = (
        await new DBService().query(
          'SELECT * FROM mediaPartOfProduct INNER JOIN media ON media.ID = mediaPartOfProduct.MID WHERE PID = ? AND media.filename = ?',
          [getIntIDFromHash(productId), filename]
        )
      ).results[0].MID

      return Product.removeMedia(productId, collaboratorId, mid)
    } catch (err) {
      throw err
    }
  }

  /**
   * Require the authenticated user to have writing permissions on the project
   * @param pid Project ID to control
   * @param uid User ID that is logged in
   * @returns `true` if the user is allowed
   * @throws an error if the user is not allowed to write
   */
  static async requireUserCanWrite(
    pid: NumberLike,
    uid: NumberLike
  ): Promise<boolean> {
    const validationRequest = await new DBService().query(
      'SELECT PID, UID FROM uploadBy WHERE PID = ? AND UID = ?',
      [pid, uid]
    )

    const valid: boolean = validationRequest.results.length > 0

    if (!valid)
      throw new Error(
        'The user does not have writing permission on this product!'
      )
    return valid
  }

  /**
   * Require the authenticated user to be a teacher having supervisedBy status on the project.
   * @param pid Project ID to control
   * @param tid User ID that is logged in
   * @returns `true` if the user is allowed
   * @throws an error if the user is not allowed to write
   */
  static async requireTeacherCanUpdate(
    pid: NumberLike,
    tid: NumberLike
  ): Promise<boolean> {
    const validationRequest = await new DBService().query(
      'SELECT PID, TID FROM supervisedBy WHERE PID = ? AND TID = ?',
      [pid, tid]
    )

    const valid: boolean = validationRequest.results.length > 0

    if (!valid)
      throw new Error(
        'The teacher does not have updating permission on this product!'
      )
    return valid
  }
}
