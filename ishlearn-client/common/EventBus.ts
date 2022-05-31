const eventBus = {
  on(event, callback) {
    document.addEventListener(event, (e) => callback(e.detail))
  },
  dispatchEvent(event, data) {
    document.dispatchEvent(new CustomEvent(event, { detail: data }))
  },
  remove(event, callback) {
    document.removeEventListener(event, callback)
  },
}
export default eventBus
