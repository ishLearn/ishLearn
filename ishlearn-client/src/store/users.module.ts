import { defineStore } from 'pinia'

import api from '@/services/api'
import { User } from '@/types/Users'

export type UsersStoreState = {
  users: { [id: string]: User | Promise<User> }
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
     * Returns a user if it is available in the store, otherwise null if it is not available.
     */
    user: (state) => {
      return (id: string): Promise<User> | User | null => {
        if (id in state.users) return state.users[id]
        return null
      }
    },
  },
  actions: {
    async fetchUser(id: string) {
      this.loadingUsers.push(id)
      this.loading = new Promise(async (resolve) => {
        this.users[id] = await new Promise(async (resolve) => {
          return resolve((await api.get<User>(`/users/${id}`)).data)
        })

        this.loadingUsers = this.loadingUsers.filter((i) => i !== id)
        resolve(true)
      })
    },
  },
})

export default useUser
