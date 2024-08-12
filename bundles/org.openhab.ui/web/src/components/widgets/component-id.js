const ids = new WeakMap()
let index = 1

export default {
  get (component) {
    if (!component || typeof component !== 'object') return undefined

    let id = ids.get(component)
    if (!id) {
      id = index
      index += 1
      ids.set(component, id)
    }

    return id
  }
}
