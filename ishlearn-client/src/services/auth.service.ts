import api from './api'
import TokenService from './token.service'

class AuthService {
  static async login({ email, password }: { email: string; password: string }) {
    return api
      .post('/auth/signin', {
        email,
        pwd: password,
      })
      .then((response) => {
        if (response.data.accessToken) {
          TokenService.setUser(response.data)
        }
        return response.data
      })
  }

  static logout() {
    TokenService.removeUser()
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
    rank: string
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
