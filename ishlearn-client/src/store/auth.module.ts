import { defineStore } from 'pinia'

import api from '@/services/api'
import { RefreshToken } from '@/types/Tokens'
import { User } from '@/types/Users'
// <import AuthService from '@/services/auth.service'

const useUser = defineStore('user', {
  state: (): {
    status: { loggedIn: boolean }
    user: User | null
    accessKey: string
    refreshKey: RefreshToken | null
  } => ({
    status: {
      loggedIn: false,
    },
    user: null,
    accessKey: '',
    refreshKey: null,
  }),
  getters: {
    localRefreshToken: () =>
      JSON.parse(localStorage.getItem('refreshToken') as string) as RefreshToken,
    localAccessToken: (state) => state.accessKey,
  },
  actions: {
    async initUser() {
      const item = localStorage.getItem('refreshToken')
      if (item == null) {
        this.status.loggedIn = false
        return
      }
      const refreshToken: RefreshToken = JSON.parse(item)

      if (refreshToken.token == null) this.status.loggedIn = false
      else {
        await this.refreshAccessToken(refreshToken)
      }
    },
    async refreshAccessToken(refreshToken?: RefreshToken) {
      try {
        // Default refreshToken to store
        if (typeof refreshToken === 'undefined') {
          if (this.refreshKey == null) throw new Error('No Refresh Token, not logged in')
          refreshToken = this.refreshKey
        }

        // Get new accessToken
        const result = (
          await api.post('/auth/refresh', {
            refreshToken: refreshToken.token,
          })
        ).data

        // Set refresh and accessToken
        this.refreshKey = result.tokenObject
        this.accessKey = result.accessToken

        // Get User info
        const data = (await api.get('/users')).data
        this.user = data.user

        // Set logged in status
        this.status.loggedIn = true
      } catch (e) {
        console.log('Could not refresh')
        console.log(e)
      }
    },
    loginSuccessful(data: { accessToken: string; refreshToken: RefreshToken; userInfo: User }) {
      this.status.loggedIn = true
      this.accessKey = data.accessToken
      this.refreshKey = data.refreshToken
      this.user = data.userInfo

      localStorage.setItem('refreshToken', JSON.stringify(data.refreshToken))
    },
    removeUser() {
      localStorage.removeItem('refreshToken')
      this.initUser()
    },
  },
})

export default useUser
