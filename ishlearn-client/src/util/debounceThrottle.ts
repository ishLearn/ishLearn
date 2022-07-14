export const debounce = (cb: (...args: unknown[]) => unknown, delay: number) => {
  let timeout: number

  return (...args: unknown[]) => {
    console.log('Clearing: ' + timeout)
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      cb(...args)
    }, delay)
    console.log('Timout: ' + timeout)
  }
}
