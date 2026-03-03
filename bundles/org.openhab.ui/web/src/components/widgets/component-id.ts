const ids = new WeakMap<object, string>()
let index = 1

export default {
  get(component: object | undefined | null): string | null {
    if (!component || typeof component !== 'object') return null

    let id = ids.get(component)
    if (!id) {
      id = index.toString()
      index += 1
      ids.set(component, id)
    }

    return id
  }
}
