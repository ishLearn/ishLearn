import DBService from '../services/DBService'
import Tag from './Tag'

export default class Category {
  /**
   * Save the tag linked to a category to the database.
   * Requires the tag to be saved in `tags`-table!
   * @returns Nothing
   */
  static async addTagAsCategoryValue(
    tagname: string,
    category: string
  ): Promise<any> {
    const res = await new DBService().query(
      `INSERT INTO categories (tag, category) VALUES (?)`,
      [tagname, category]
    )

    return res.results
  }

  /**
   * Get tags belonging to a category.
   * @param category Category to search tags for
   * @returns The tags from the category
   */
  static async getTagsFromCategory(category: string): Promise<Tag[]> {
    return (
      await new DBService().query(
        'SELECT * FROM categories WHERE category = ? LIMIT ?',
        [category, Tag.QUERY_LIMIT * 2]
      )
    ).results
  }

  /**
   * Search tags belonging to a category, using the Regex.
   * @param category Category to search tags for
   * @param tagnameBeginning The Regex to filter by
   * @returns The tags from the category matching the Regex
   */
  static async searchTagFromCat(
    category: string,
    tagnameBeginning: string
  ): Promise<Tag[]> {
    return (
      await new DBService().query(
        'SELECT * FROM categories WHERE category = ? AND tag REGEXP ? LIMIT ?',
        [category, tagnameBeginning, Tag.QUERY_LIMIT]
      )
    ).results
  }

  /**
   * Remove a tag from a category
   * @param category Category to remove tag from
   * @param tagname Tag to remove
   * @returns Nothing
   */
  static async removeTagFromCat(
    category: string,
    tagname: string
  ): Promise<any> {
    return (
      await new DBService().query(
        'DELETE FROM categories WHERE category = ? AND tag = ?',
        [category, tagname]
      )
    ).results
  }
}
