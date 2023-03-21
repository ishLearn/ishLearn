import { defineStore } from 'pinia'

import api from '@/services/api'
import { Product } from '@/types/Products'

export type ProductsStoreState = {
  products: { [id: string]: Product }
  loadingProducts: string[]
  loading: Promise<boolean> | null
}

const useProduct = defineStore('products', {
  state: (): ProductsStoreState => ({
    products: {},
    loadingProducts: [],
    loading: null,
  }),
  getters: {
    availableProducts: (state) => state.products,
    /**
     * Returns a Product if it is available in the store, otherwise, returns true if product is not available yet but is being fetched, or null if it is not available.
     */
    product: (state) => {
      return (id: string): Product | boolean | null => {
        if (id in state.products) return state.products[id]
        if (state.loadingProducts.includes(id)) return true
        return null
      }
    },
  },
  actions: {
    async fetchProduct(id: string) {
      this.loadingProducts.push(id)
      this.loading = new Promise(async (resolve) => {
        this.products[id] = new Product((await api.get(`/products/${id}`)).data)

        this.loadingProducts = this.loadingProducts.filter((i) => i !== id)
        resolve(true)
      })
    },
    addProducts(products: Product[]) {
      for (const p of products) {
        if (p.id && !this.products[p.id]) this.products[p.id] = p
      }
    },
  },
})

export default useProduct
