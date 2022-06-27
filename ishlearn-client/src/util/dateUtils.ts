export const formatDate = (datestring: string | Date) => {
  const myDate = typeof datestring === 'string' ? new Date(datestring) : datestring
  return `${myDate.toLocaleDateString('de-DE')}, ${myDate
    .toLocaleTimeString('de-DE')
    .substring(0, 5)}`
}
export const id = 1
