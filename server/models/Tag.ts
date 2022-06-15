import DBService from '../services/DBService'

/**
 * A Product is a unit of files, comments and other content and information.
 * It's Primary Key is a AUTO-INCREMENT INT ID, for the Frontend
 * hashed with the {@link https://www.npmjs.com/package/hashids hashids} package.
 *
 * @see {@link Tag.tagname}
 * @author @SebastianThomas
 */
export default class Tag {
  tag: string

  static QUERY_LIMIT = 20

  constructor(tag: string) {
    this.tag = tag
  }

  /**
   * Retrieve the specified fields from a Product from the DB, and return it.
   *
   * @param tagname The ID to search for. Can be provided as either number (search for the exact number ID in the DB) or string (search for the decoded ID in the DB).
   * @returns The found Tag in the DB
   * @throws Error if the Tag is not found
   */
  static async getTagByTagname(tagname: string): Promise<Tag> {
    const res = await (
      await new DBService().query('SELECT * FROM tags WHERE tag = ?', [tagname])
    ).results
    return res
  }

  /**
   * Find some products from the DB.
   * @param page The pages to skip, defaults to 0
   * @returns the {@link Tag.QUERY_LIMIT} first / from page products from the DB
   */
  static async getTags(page?: number): Promise<Tag[]> {
    page = page || 0

    const query = 'SELECT * FROM tags LIMIT ? OFFSET ?'

    const res = await new DBService().query(query, [
      Tag.QUERY_LIMIT,
      page * Tag.QUERY_LIMIT,
    ])

    return res.results
  }

  static async search(tagnameBeginning: string): Promise<Tag[]> {
    return (
      await new DBService().query(
        'SELECT * FROM tags WHERE tag REGEXP ? LIMIT ?',
        [tagnameBeginning, Tag.QUERY_LIMIT]
      )
    ).results
  }

  /**
   * Save the tag to the database
   * @returns The new Tag's id
   */
  static async save(tagname: string): Promise<any> {
    const res = await new DBService().query(
      `INSERT INTO tags (tag) VALUES (?)`,
      [tagname]
    )

    return res.results
  }

  /**
   * Delete the tag to the database
   * @returns The new Tag's id
   */
  static async delete(tagname: string): Promise<any> {
    const res = await new DBService().query(`DELETE FROM tags WHERE tag = ?`, [
      tagname,
    ])

    return res.results
  }
}
