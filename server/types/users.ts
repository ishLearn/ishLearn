import User from '../models/User'

export type UserRecord = {
  user?: User
  wrongToken?: boolean
  unauthenticated?: boolean
  accessToken?: string
  refreshToken?: string
}
