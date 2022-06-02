import api from './api'

// Import types
import { User } from '@/types/Users'
import { RefreshToken } from '@/types/Tokens'

// Setup store
import useStore from '@/store/auth.module'
const store = useStore()

class AuthService {
  static async login({ email, password }: { email: string; password: string }) {
    return api
      .post('/auth/signin', {
        email,
        pwd: password,
      })
      .then(
        (response: {
          data: {
            refreshToken: RefreshToken
            accessToken: string
            userInfo: User
            totalUserTokens: number
          }
        }) => {
          if (response.data.accessToken) {
            store.loginSuccessful(response.data)
          }
          return response.data
        },
      )
  }

  static logout() {
    store.removeUser()
  }

  static async register({
    firstName,
    lastName,
    email,
    password,
    rank,
  }: {
    firstName: string
    lastName: string
    email: string
    password: string
    rank: boolean
  }) {
    const r = rank ? 'student' : 'teacher'
    console.log(r)
    return api.post('/users/', {
      firstName,
      lastName,
      email,
      password,
      rank: r,
    })
  }
}
export default AuthService
