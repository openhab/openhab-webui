
export default {
  ids: new WeakMap(),
  index: 1,
  get (component) {
    if (!component || typeof component !== 'object') return undefined

    let id = this.ids.get(component)
    if (!id) {
      id = this.index
      this.index += 1
      this.ids.set(component, id)
    }

    return id
  }
}
