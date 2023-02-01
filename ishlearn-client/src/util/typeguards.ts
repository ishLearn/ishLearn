import { AxiosError } from 'axios'

export const isAxiosError = (err: unknown): err is AxiosError => {
  return (
    typeof (err as AxiosError).response?.status !== 'undefined' &&
    (typeof (err as AxiosError).response?.status === 'number' ||
      typeof (err as AxiosError).response?.status === 'string')
  )
}
