import useUser from '@/store/auth.module'
import { storeToRefs } from 'pinia'
import api from './api'

console.log('Token.service')
// throw new Error()
const userPinia = useUser()
console.log('Token.service')
// eslint-disable-next-line
const { status, user, accessKey, refreshKey } = storeToRefs(userPinia)

class TokenService {
  constructor() {
    this.resetUserByRefreshToken()
  }

  resetUserByRefreshToken = () => {
    console.log('resetUserByRefreshToken')
    const refreshToken = JSON.parse(localStorage.getItem('refreshToken') as string)
    if (refreshToken) {
      refreshKey.value = refreshToken
      api.post('/auth/refresh/', { refreshToken }).then((response) => {
        accessKey.value = response.data.accessToken
      })
      if (accessKey) {
        api
          .get('/users/', {
            headers: {
              Authorization: `Bearer ${accessKey.value}`,
            },
          })
          .then((response) => {
            console.log('Die Antwort!')
            console.log(response)
          })
        return
      }
    }

    status.value.loggedIn = false
  }

  getLocalRefreshToken = () => JSON.parse(localStorage.getItem('refreshToken') as string)

  getLocalAccessToken = () => accessKey.value

  updateLocalAccessToken = (token: string) => {
    accessKey.value = token
  }

  // TODO: Hello
  getUser = () => JSON.parse(localStorage.getItem('user') as string)

  // TODO
  setUser = (newUser: any) => {
    console.log(JSON.stringify(newUser))
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  removeUser = () => {
    localStorage.removeItem('refreshToken')
    this.resetUserByRefreshToken()
  }
}
export default new TokenService()
