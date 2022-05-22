export const wait = (ms: number) => {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}
