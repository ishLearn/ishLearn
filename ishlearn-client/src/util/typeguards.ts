import { AxiosError } from 'axios'

export const isAxiosError = (err: unknown): err is AxiosError => {
  console.log(err as AxiosError)
  console.log((err as AxiosError).response?.status)
  return (
    typeof (err as AxiosError).response?.status !== 'undefined' &&
    (typeof (err as AxiosError).response?.status === 'number' ||
      typeof (err as AxiosError).response?.status === 'string')
  )
}
