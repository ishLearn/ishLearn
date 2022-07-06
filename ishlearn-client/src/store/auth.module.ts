import { defineStore } from 'pinia'

import api from '@/services/api'
import { RefreshToken } from '@/types/Tokens'
import { User } from '@/types/Users'
// <import AuthService from '@/services/auth.service'

export type UserStoreState = {
  status: { loggedIn: boolean }
  user: User | null
  accessKey: string
  refreshKey: RefreshToken | null
  loading: Promise<boolean> | null
}

const useUser = defineStore('user', {
  state: (): UserStoreState => ({
    status: {
      loggedIn: false,
    },
    user: null,
    accessKey: '',
    refreshKey: null,
    loading: null,
  }),
  getters: {
    localRefreshToken: () =>
      JSON.parse(localStorage.getItem('refreshToken') as string) as RefreshToken,
    localAccessToken: (state) => state.accessKey,
  },
  actions: {
    async initUser() {
      this.loading = new Promise(async (resolve) => {
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

        resolve(true)
      })
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

        if (!this.user) return 'User not logged in'

        // Set logged in status
        this.status.loggedIn = true

        // Get user profile text
        this.user.profileText = await (await api.get(`/users/${this.user.id}/text`)).data
      } catch (e) {
        console.log('Could not refresh')
        console.log(e)
      }
    },
    loginSuccessful(input: { accessToken: string; refreshToken: RefreshToken; userInfo: User }) {
      this.status.loggedIn = true
      this.accessKey = input.accessToken
      this.refreshKey = input.refreshToken
      this.user = input.userInfo

      localStorage.setItem('refreshToken', JSON.stringify(input.refreshToken))
    },
    removeUser() {
      localStorage.removeItem('refreshToken')
      this.initUser()
    },
  },
})

export default useUser
