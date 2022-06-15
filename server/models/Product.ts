import DBService, {
  getHashFromIntID,
  getIntIDFromHash,
  Visibility,
} from '../services/DBService'

import { NumberLike } from 'hashids/cjs/util'
import { ID } from '../types/ids'

// User model import
import User from './User'
// RedisService import
import { addProduct, searchProductById } from '../services/RedisService'

/**
 * A Product is a unit of files, comments and other content and information.
 * It's Primary Key is a AUTO-INCREMENT INT ID, for the Frontend
 * hashed with the {@link https://www.npmjs.com/package/hashids hashids} package.
 *
 * @see {@link Product.id}
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

  static QUERY_LIMIT = '50'

  static normalQuery = `SELECT ?? FROM products AS products WHERE products.visibility = "public"`
  static adminQuery = `SELECT ?? FROM products AS products`
  static studentQuery = `SELECT ?? FROM products INNER JOIN uploadBy ON products.ID = uploadBy.PID WHERE (products.visibility = "public" OR uploadBy.UID = ?)`
  static teachersQuery = `SELECT ?? FROM products INNER JOIN supervisedBy ON products.ID = supervisedBy.PID (WHERE products.visibility = "public" OR supervisedBy.TID = ?)`

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
    id?: ID | NumberLike
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
  }

  /**
   * Map all ids from a product result (from DB) to HashIDs
   * @param result the DB query's result
   * @returns The result. with hashed ids
   */
  static mapResultsToHash(result: {
    id: NumberLike | string
    title: string
    visibility: Visibility | string
    updatedBy: NumberLike | string
    createdBy: NumberLike | string
    createDate?: Date
    updatedDate?: Date
  }) {
    return new Product(
      result.title,
      result.visibility,
      result.updatedBy,
      result.createdBy,
      result.createDate,
      result.updatedDate,
      result.id
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

    const id = typeof idInput === 'string' ? getIntIDFromHash(idInput) : idInput
    const query =
      (typeof loggedInUser === 'undefined'
        ? Product.normalQuery
        : loggedInUser.rank === 'student'
        ? Product.studentQuery
        : loggedInUser.rank === 'admin'
        ? Product.adminQuery
        : Product.teachersQuery) + ` AND ID = ? LIMIT 1`

    return (await new DBService().query(query, [fields, id])).results.map(
      Product.mapResultsToHash
    )
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
          } WHERE title REGEXP ?
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

    // Send Query and return result
    const results: Product[] = (
      await new DBService().query(query, params)
    ).results.map(Product.mapResultsToHash)

    results.forEach(p => {
      addProduct(p)
    })

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
      config.loggedInUser?.id,
    ])

    const { results } = res
    return results.map(
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
    )
  }

  /**
   * Save the product to the database. Does not update `this` product.
   * @param users the user's IDs
   * @returns The new Product's id
   */
  async save(...users: number[] | string[]): Promise<number> {
    if (typeof this.id !== 'undefined')
      throw new Error('Product has already been saved')

    let usersNrs: number[] | NumberLike[]
    usersNrs = users.map(user => {
      if (typeof user === 'string') return getIntIDFromHash(user)
      return user
    })

    const res = await new DBService().query(
      `INSERT INTO products (title, visibility, updatedBy, createdBy) VALUES (?)`,
      [[this.title, this.visibility, this.updatedBy, this.createdBy]]
    )

    const resUploadBy = await new DBService().query(
      `INSERT INTO uploadBy (PID, UID) VALUES (?)`,
      usersNrs.map((user: number | NumberLike) => [res.results.insertId, user])
    )

    this.id = res.results.insertId

    return res.results.insertId
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

    const resUploadBy = await new DBService().query(
      `INSERT INTO uploadBy (PID, UID) VALUES (?)`,
      [[productId, userId]]
    )

    return resUploadBy.results
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

    const resUploadBy = await new DBService().query(
      `DELETE FROM uploadBy WHERE PID = ? AND UID = ?`,
      [productId, userId]
    )

    return resUploadBy.results
  }

  static async setLastModified(productId: NumberLike, userId: NumberLike) {
    return await new DBService().query(
      `UPDATE products SET updatedBy = ? WHERE ID = ?`,
      [userId, productId]
    )
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
    const validationRequest = await new DBService().query(
      'SELECT PID, UID FROM uploadBy WHERE PID = ? AND UID = ?',
      [pid, cid]
    )

    const valid = validationRequest.results.length > 0

    if (valid) {
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
    throw new Error(`User is not valid; has not been entered`)
  }

  /**
   * Update tags for the product.
   * @param productId the hashed product id
   * @param collaboratorId the hashed collaborator
   * @param tags the tags to add or remove, should always be an array of strings
   * @param add whether to add or to remove the tags
   * @returns am array of all Promise results
   */
  static async updateTags(
    productId: string,
    collaboratorId: string,
    tags: string[],
    add: boolean
  ) {
    const pid = getIntIDFromHash(productId)
    const cid = getIntIDFromHash(collaboratorId)
    const validationRequest = await new DBService().query(
      'SELECT PID, UID FROM uploadBy WHERE PID = ? AND UID = ?',
      [pid, cid]
    )

    const valid = validationRequest.results.length > 0

    if (valid) {
      return add
        ? await this.addTags(pid, cid, tags)
        : await this.removeTags(pid, cid, tags)
    }
    throw new Error(`User is not valid; has not been entered`)
  }

  /**
   * Update: Add tags for the product.
   * @param pid the unhashed product id
   * @param cid the unhashed collaborator id
   * @param tags the tags to add, should always be an array of strings
   * @returns an array of all Promise results
   */
  static async addTags(pid: NumberLike, cid: NumberLike, tags: string[]) {
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
    const query = 'DELETE FROM productHasTag WHERE PID = ? AND UID = ?'
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
   * Update: Add an existing media to the product
   * @param productId the hashed product id
   * @param collaboratorId the hashed collaborator id
   * @param mediaId the hashed media id to add
   * @returns an array of all Promise results
   */
  static async addMedia(
    productId: string,
    collaboratorId: string,
    mediaId: string
  ) {
    const pid = getIntIDFromHash(productId)
    const cid = getIntIDFromHash(collaboratorId)
    const mid = getIntIDFromHash(mediaId)

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
   * @param mediaId the hashed media id to add
   * @returns an array of all Promise results
   */
  static async removeMedia(
    productId: string,
    collaboratorId: string,
    mediaId: string
  ) {
    const pid = getIntIDFromHash(productId)
    const cid = getIntIDFromHash(collaboratorId)
    const mid = getIntIDFromHash(mediaId)

    const result = [
      await new DBService().query(
        'INSERT INTO mediaPartOfProduct SET PID = ?, MID = ?',
        [pid, mid]
      ),
    ]

    result.push(await Product.setLastModified(pid, cid))

    return result
  }
}
