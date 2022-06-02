import axiosInstance from './api'

import pinia from '@/store/pinia'
import useStore from '@/store/auth.module'
const store = useStore(pinia)

const setup = () => {
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = store.localAccessToken
      if (typeof token !== 'undefined' && token.length > 0) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error),
  )
  axiosInstance.interceptors.response.use(
    (res) => res,
    async (err) => {
      const originalConfig = err.config
      if (originalConfig.url !== '/auth/signin' && err.response) {
        // AccessToken was expired
        if (err.response.status === 401 && !originalConfig._retry) {
          originalConfig._retry = true
          try {
            await store.refreshAccessToken()
            return axiosInstance(originalConfig) // TODO: Send new Header or auto update?
          } catch (_error) {
            return Promise.reject(_error)
          }
        }
      }
      return Promise.reject(err)
    },
  )
}
export default setup
