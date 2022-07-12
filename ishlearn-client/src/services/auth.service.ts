import api from './api'

// Import types
import { User } from '@/types/Users'
import { RefreshToken } from '@/types/Tokens'

// Setup store
import pinia from '@/store/pinia'
import useStore from '@/store/auth.module'
const store = useStore(pinia)

class AuthService {
  static async login({ email, password }: { email: string; password: string }) {
    const response: {
      refreshToken: RefreshToken
      accessToken: string
      userInfo: User
      totalUserTokens: number
    } = (
      await api.post('/auth/signin', {
        email,
        pwd: password,
      })
    ).data

    if (typeof response.accessToken !== 'undefined') {
      store.loginSuccessful(response)
    }

    if (store.user) {
      // Get user profile text
      const { data } = await api.get(`/users/${response.userInfo.id}/text`)
      store.user.profileText = data
    }

    return response
  }

  static async logout() {
    try {
      return (await api.post('/auth/signout/', { refreshToken: store.refreshKey?.token })).data
    } catch (err) {
      console.log('Error during log out')
      console.log(err)
    } finally {
      store.removeUser()
    }
  }

  static async register({
    firstName,
    lastName,
    birthday,
    email,
    password,
    rank,
  }: {
    firstName: string
    lastName: string
    birthday: string
    email: string
    password: string
    rank: boolean
  }) {
    const r = rank ? 'student' : 'teacher'
    return api.post('/users/', {
      firstName,
      lastName,
      birthday,
      email,
      password,
      rank: r,
    })
  }
}
export default AuthService
