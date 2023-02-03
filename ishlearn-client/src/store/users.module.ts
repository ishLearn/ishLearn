import { defineStore } from 'pinia'

import api from '@/services/api'
import { User } from '@/types/Users'

export type UsersStoreState = {
  users: { [id: string]: User }
  loadingUsers: string[]
  loading: Promise<boolean> | null
}

const useUser = defineStore('users', {
  state: (): UsersStoreState => ({
    users: {},
    loadingUsers: [],
    loading: null,
  }),
  getters: {
    availableUsers: (state) => state.users,
    /**
     * Returns a user if it is available in the store, otherwise, returns true if user is not available yet but is being fetched, or null if it is not available.
     */
    user: (state) => {
      return (id: string): User | boolean | null => {
        if (id in state.users) return state.users[id]
        if (state.loadingUsers.includes(id)) return true
        return null
      }
    },
  },
  actions: {
    async fetchUser(id: string) {
      this.loadingUsers.push(id)
      this.loading = new Promise(async (resolve) => {
        this.users[id] = (await api.get(`/users/${id}`)).data

        this.loadingUsers = this.loadingUsers.filter((i) => i !== id)
        resolve(true)
      })
    },
  },
})

export default useUser
