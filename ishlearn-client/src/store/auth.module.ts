import { defineStore } from 'pinia';

// import AuthService from '@/services/auth.service'
const user = JSON.parse(localStorage.getItem('user') as string);
const initialState = user
  ? { status: { loggedIn: true }, user }
  : { status: { loggedIn: false }, user: null };

export const useUser = defineStore('user', {
  state: () => {
    return {
      state: initialState,
      username: null,
      accessKey: null,
      refreshKey: null,
    }
  },
})
