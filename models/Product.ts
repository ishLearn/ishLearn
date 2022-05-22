import DBService, {
  getHashFromIntID,
  getIntIDFromHash,
  Visibility,
} from '../services/DBService'

import Logger from '../utils/Logger'

import { ID } from '../types/ids'

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
   * @returns The new Product's id
   */
  async save(): Promise<number> {
    if (typeof this.id !== 'undefined')
      throw new Error('Product has already been saved')
    const res = await new DBService().query(
      `INSERT INTO products (title, visibility, updatedBy, createdBy) VALUES (?)`,
      [[this.title, this.visibility, this.updatedBy, this.createdBy]]
    )

    this.id = res.results.insertId

    return res.results.insertId
  }
}
