import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import RefreshToken from '../models/RefreshToken'
import User from '../models/User'
import { UserRecord } from '../types/users'

export default async (
  req: Request,
  res: Response<{}, UserRecord>,
  next: NextFunction
) => {
  if (req.headers['Authorization']) {
    const authHeader = req.headers['Authorization']
    const bearerToken =
      typeof authHeader === 'string' ? authHeader : authHeader[0]
    const token = bearerToken.split(' ')[1]

    console.log(
      `authHeader: ${authHeader}, bearerToken: ${bearerToken}, token: ${token}`
    )

    const verified = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_JWT_SECRET || ''
    )
    if (verified) {
      const decoded = jwt.decode(token)
      if (decoded !== null && typeof decoded === 'string')
        res.locals.user = await User.getFullUserById(decoded)
    }
    if (!res.locals.user) res.locals.wrongToken = true
  }
  if (!res.locals.user) res.locals.unauthenticated = true
  else res.locals.unauthenticated = false

  next()
}
