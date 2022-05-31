class TokenService {
  getLocalRefreshToken = () => {
    const user = JSON.parse(localStorage.getItem('user') as string)
    return user?.refreshToken
  }

  getLocalAccessToken = () => {
    const user = JSON.parse(localStorage.getItem('user') as string)
    return user?.accessKey
  }

  updateLocalAccessToken = (token: string) => {
    const user = JSON.parse(localStorage.getItem('user') as string)
    user.accessToken = token
    localStorage.setItem('user', JSON.stringify(user))
  }

  getUser = () => JSON.parse(localStorage.getItem('user') as string)

  setUser = (user: any) => {
    console.log(JSON.stringify(user))
    localStorage.setItem('user', JSON.stringify(user))
  }

  removeUser = () => {
    localStorage.removeItem('user')
  }
}
export default new TokenService()
