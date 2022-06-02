import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User'
import { UserRecord } from '../types/users'

export const authMiddleware = async (
  req: Request,
  res: Response<{}, UserRecord>,
  next: NextFunction
) => {
  // Get access token and user
  if (req.headers['Authorization'] || req.headers['authorization']) {
    const authHeader =
      req.headers['Authorization'] || req.headers['authorization'] || ''
    const bearerToken =
      typeof authHeader === 'string' ? authHeader : authHeader[0]
    const token = bearerToken.split(' ')[1]

    res.locals.accessToken = token

    const verified = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_JWT_SECRET || ''
    )
    if (verified) {
      const decoded = jwt.decode(token) as { id: string }

      if (decoded !== null)
        res.locals.user = await User.getFullUserById(decoded.id) // Check if decoded or decoded.id
    }
    if (!res.locals.user) res.locals.wrongToken = true
    else res.locals.wrongToken = false
  }
  if (!res.locals.user) res.locals.unauthenticated = true
  else res.locals.unauthenticated = false

  if (req.body?.refreshToken) res.locals.refreshToken = req.body.refreshToken

  if (res.locals.wrongToken)
    return res.status(403).json({
      err: 'Token not valid!',
    })

  next()
}
