export const debounce = (cb: (...args: unknown[]) => unknown, delay: number) => {
  let timeout: number

  return (...args: unknown[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      cb(...args)
    }, delay)
  }
}
