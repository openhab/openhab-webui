const ids = new WeakMap<object, number>()
let index = 1

export default {
  get(component: object | undefined | null): number | null {
    if (!component || typeof component !== 'object') return null

    let id = ids.get(component)
    if (!id) {
      id = index
      index += 1
      ids.set(component, id)
    }

    return id
  }
}
