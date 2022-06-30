export const formatDate = (datestring: string | Date) => {
  const myDate = typeof datestring === 'string' ? new Date(datestring) : datestring
  return `${myDate.toLocaleDateString('de-DE')}, ${myDate
    .toLocaleTimeString('de-DE')
    .substring(0, 5)}`
}

export const twoLeadingZeros = (num: number) => {
  return num.toString().padStart(2, '0')
}
export const toYYYYMMDD = (date: Date) => {
  return `${date.getFullYear()}-${twoLeadingZeros(date.getMonth() + 1)}-${twoLeadingZeros(
    date.getDate(),
  )}`
}
export const id = 1
