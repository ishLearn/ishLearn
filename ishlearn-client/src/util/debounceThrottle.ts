export const debounce = (cb: (...args: any[]) => any, delay: number) => {
  let timeout: number

  return (...args: any[]) => {
    console.log('Clearing: ' + timeout)
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      cb(...args)
    }, delay)
    console.log('Timout: ' + timeout)
  }
}
