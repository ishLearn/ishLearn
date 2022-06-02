import { defineStore } from 'pinia'
// <import AuthService from '@/services/auth.service'

const useUser = defineStore('user', {
  state: () => ({
    status: {
      loggedIn: false,
    },
    user: null,
    accessKey: '',
    refreshKey: null,
  }),
})

let initialState = {}
const initUser = () => {
  const user = JSON.parse(localStorage.getItem('user') as string)
  console.log('Init User')
  console.log(localStorage.getItem('user'))
  console.log(user.refreshToken)
  const { refreshToken } = user

  console.log('HERE')
  initialState = user
    ? { status: { loggedIn: true }, user }
    : { status: { loggedIn: false }, user: null }
}
// initUser()
// TODO:
// refresh Token speichern
// accesstoken generieren /api/auth/refresh
// get('api/users/') -> usersroute

// export initUser
export default useUser
