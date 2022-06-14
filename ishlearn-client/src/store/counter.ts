// stores/counter.js
import { defineStore } from 'pinia'

const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  // could also be defined as
  // state: () => ({ count: 0 })
  actions: {
    increment() {
      this.count += 1
    },
  },
})
export default useCounterStore
