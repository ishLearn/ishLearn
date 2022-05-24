import DBService, {
  getHashFromIntID,
  getIntIDFromHash,
  Visibility,
} from '../services/DBService'

import Logger from '../utils/Logger'

import { ID } from '../types/ids'
import { NumberLike } from 'hashids/cjs/util'

/**
 * A Product is a unit of files, comments and other content and information.
 * It's Primary Key is a AUTO-INCREMENT INT ID, for the Frontend
 * hashed with the {@link https://www.npmjs.com/package/hashids hashids} package.
 *
 * @see {@link Product.id}
 * @author Sebastian Thomas
 */
export default class Product {
  id?: ID
  title: string
  visibility: Visibility | string
  updatedBy: number
  createdBy: number
  createDate?: Date
  updatedDate?: Date

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
    updatedBy: number,
    createdBy: number,
    createDate?: Date,
    updatedDate?: Date,
    id?: ID | number
  ) {
    this.title = title
    this.visibility = visibility
    this.createDate = createDate
    this.updatedDate = updatedDate
    this.updatedBy = updatedBy
    this.createdBy = createdBy
    this.id = typeof id === 'number' ? getHashFromIntID(id) : id
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
    fields: string[]
  ): Promise<Product> {
    const id = typeof idInput === 'string' ? getIntIDFromHash(idInput) : idInput
    return (
      await new DBService().query('SELECT ?? FROM products WHERE id = ?', [
        fields,
        id,
      ])
    ).results
  }

  /**
   * TODO: Heavily test this search function
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
  ): Promise<Product> {
    const conditionQuery: string = queryString || ''
    const collaboratorNumberIds: NumberLike[] =
      collaborators?.map(v => getIntIDFromHash(v)) || []
    const tagValues: string[] = tags || []

    const cIdsExist = collaboratorNumberIds.length > 0
    const tagVExist = tagValues.length > 0

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

    // Set SQL Query Params
    const params: Array<string | NumberLike[] | string[] | number> = []

    if (collaboratorNumberIds.length > 0) params.push(collaboratorNumberIds)
    if (tagValues.length > 0) params.push(tagValues)
    params.push(conditionQuery)
    if (tagVExist) params.push(tagValues.length)
    if (cIdsExist) params.push(collaboratorNumberIds.length)

    console.log(params)

    // Send Query and return result
    return (await new DBService().query(query, params)).results
  }

  /**
   * Retrieve a User from the DB, and return it.
   * Retrieved fields:
   * - title
   * - visibility
   * - create date
   * - updated date
   * - updated by
   *
   * @param id The ID to search for
   * @returns The found Product in the DB
   * @throws Error if the User is not found
   */
  static async getFullProductById(id: number | string): Promise<Product> {
    const r = await Product.getProductById(id, [
      'title',
      'visibility',
      'createDate',
      'updatedDate',
      'updatedBy',
    ])
    return r
  }

  /**
   * Find some products from the DB.
   * @returns the 50 first products from the DB
   */
  static async getFirstProducts(): Promise<Product[]> {
    const res = await new DBService().query(
      `SELECT ?? FROM products WHERE visibility="public" LIMIT 50`,
      [
        [
          'ID',
          'title',
          'visibility',
          'createDate',
          'updatedDate',
          'updatedBy',
          'createdBy',
        ],
      ]
    )

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
}
