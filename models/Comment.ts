import { NumberLike } from 'hashids/cjs/util'
import DBService, { getIntIDFromHash } from '../services/DBService'
import Media from './Media'

/**
 * Model for User comments on Products.
 *
 * @author @SebastianThomas
 */
export default class Comments {
  static getCommentFileName(pid: string, uid: string) {
    return `comment-${pid}-${uid}.md`
  }
  static getCommentFilePath(pid: string, filename: string) {
    return Media.getFilename(`comments/${filename}`, pid)
  }

  /**
   *
   * @param pid ProjectID (hashed)
   * @param uid UserID (hashed)
   * @param text Text content of the comment
   * @param rating Rating (number) to the product
   */
  static async uploadTextThenSaveToDB(
    pid: string,
    uid: string,
    text: string,
    rating?: number
  ) {
    const filename = Comments.getCommentFileName(pid, uid)

    const res = await Media.uploadMedia(filename, pid, Buffer.from(text))

    if (typeof res === 'undefined' || !('worked' in res) || !res.worked)
      throw new Error(`Could not upload comment to S3`)

    const path = Comments.getCommentFilePath(pid, filename)
    const m = await Media.save(filename, path, pid)

    return await Comments.save(pid, uid, m, rating)
  }

  /**
   * Save a new Comment to DB. ID as well as Created and Update Times auto-generated.
   * @param pid ProjectID (hashed)
   * @param uid UserID (hashed)
   * @param mid Media ID (hashed) of this comment's text
   * @param rating number indicating this comment's rating of the product, may be null
   * @returns The new Comment's ID
   */
  static async save(
    pid: string,
    uid: string,
    mid: string | NumberLike,
    rating?: number
  ) {
    const mediaPartOfProduct = await new DBService().query(
      `INSERT INTO comments (PID, UID, MID, rating) VALUES (?)`,
      [
        getIntIDFromHash(pid),
        getIntIDFromHash(uid),
        typeof mid === 'string' ? getIntIDFromHash(mid) : mid,
        rating,
      ]
    )
    return mediaPartOfProduct.results.insertId
  }

  /**
   * Get all comments for a given project
   * @param pid Product's ID (hashed) to search for
   * @returns An array (results of the DB query) of all comments to the product
   */
  static async getCommentsForProduct(pid: string) {
    return (
      await new DBService().query(
        `SELECT PID, UID, MID, createdTime, updatedTime, rating FROM comments WHERE pid = ?`,
        [getIntIDFromHash(pid)]
      )
    ).results
  }

  /**
   * Get all comments for a given project
   * @param uid User's ID (hashed) to search for
   * @returns An array (results of the DB query) of all comments to the product
   */
  static async getCommentsForUser(uid: string) {
    return (
      await new DBService().query(
        `SELECT PID, UID, MID, createdTime, updatedTime, rating FROM comments WHERE uid = ?`,
        [getIntIDFromHash(uid)]
      )
    ).results
  }
}
