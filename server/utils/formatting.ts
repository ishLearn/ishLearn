export function formatDate(delimiter: string, dt: Date): string {
  return `${dt.getFullYear()}${delimiter}${String(dt.getMonth() + 1).padStart(
    2,
    '0'
  )}${delimiter}${String(dt.getDate()).padStart(2, '0')}`
}

export function formatTime(delimiter: string, dt: Date): string {
  return dt.toLocaleTimeString('de-DE').replace(/:/g, delimiter)
}
