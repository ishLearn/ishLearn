import DBService from '../services/DBService'

export const deleteOuttimedRefreshTokens = async () => {
  const results = await (
    await new DBService().query(
      `DELETE FROM refreshtokens WHERE expiryDate < NOW()`
    )
  ).results

  return await results.affectedRows
}
