import { NumberLike } from 'hashids/cjs/util'
import DBService, {
  getHashFromIntID,
  getIntIDFromHash,
} from '../services/DBService'
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
   * Replace all comments' IDs with "hashed" IDs.
   * @param c Comment to map
   * @returns The mapped comment
   */
  static async commentMapper(c: {
    PID: NumberLike
    UID: NumberLike
    MID: NumberLike
    createdTime: Date
    updatedTime: Date
    rating: number
    filename: string
    URL: string
  }) {
    return {
      pid: getHashFromIntID(c.PID),
      uid: getHashFromIntID(c.UID),
      mid: getHashFromIntID(c.MID),
      createdTime: c.createdTime,
      updatedTime: c.updatedTime,
      rating: c.rating,
      filename: c.filename,
      URL: c.URL,
    }
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

    const res = await Media.uploadMedia(filename, Buffer.from(text), {
      project: pid,
      fileType: 'text/markdown'
    })

    if (typeof res === 'undefined' || !('worked' in res) || !res.worked)
      throw new Error(`Could not upload comment to S3`)

    const path = Comments.getCommentFilePath(pid, filename)
    const m = await Media.saveToMediaOnly(filename, path)

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
        `SELECT products.PID AS PID, products.UID AS UID, products.MID AS MID, products.createdTime AS createdTime, products.updatedTime AS updatedTime, products.rating AS rating, media.filename AS filename, media.URL AS URL FROM comments INNER JOIN media ON media.ID = comments.MID WHERE pid = ?`,
        [getIntIDFromHash(pid)]
      )
    ).results.map(Comments.commentMapper)
  }

  /**
   * Get all comments for a given project
   * @param uid User's ID (hashed) to search for
   * @returns An array (results of the DB query) of all comments to the product
   */
  static async getCommentsForUser(uid: string) {
    return (
      await new DBService().query(
        `SELECT products.PID AS PID, products.UID AS UID, products.MID AS MID, products.createdTime AS createdTime, products.updatedTime AS updatedTime, products.rating AS rating, media.filename AS filename, media.URL AS URL FROM comments INNER JOIN media ON media.ID = comments.MID WHERE uid = ?`,
        [getIntIDFromHash(uid)]
      )
    ).results.map(Comments.commentMapper)
  }

  // GET comments not needed, since they can be retrieved by `/api/files/download` with the file path
}
