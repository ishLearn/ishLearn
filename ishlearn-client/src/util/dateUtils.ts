export const formatDate = (datestring: string) => {
  const myDate = new Date(datestring)
  return `${myDate.toLocaleDateString('de-DE')}, ${myDate.toLocaleTimeString('de-DE').substring(0, 5)}`
}
export const id = 1
