import { AxiosError } from 'axios'

export const isAxiosError = (err: unknown): err is AxiosError => {
  return (
    typeof (err as AxiosError).status !== 'undefined' &&
    (typeof (err as AxiosError).status === 'number' ||
      typeof (err as AxiosError).status === 'string') &&
    typeof (err as AxiosError).message !== 'undefined' &&
    (err as AxiosError).message === 'string'
  )
}
