import api from './api'
import TokenService from './token.service'

class AuthService {
  static async login({ email, password }: { email: string; password: string }) {
    return api
      .post('/auth/signin', {
        email,
        password,
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
    username,
    email,
    password,
  }: {
    username: string
    email: string
    password: string
  }) {
    return api.post('/auth/signup', {
      username,
      email,
      password,
    })
  }
}
export default AuthService
