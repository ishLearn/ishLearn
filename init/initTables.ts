import dotenv from 'dotenv'
dotenv.config()

import DBService, { createDefaultTables } from '../services/DBService'

;(async () => {
  await new DBService().ping(await new DBService().getConnection())
  const result = await createDefaultTables()
  console.log(result)
  console.log('Successfully created default tables')
})()
