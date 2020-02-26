import Vue from 'vue'

const handler = {
  get (obj, prop) {
    if (prop === '_keys') return Object.keys(obj)
    if (obj[prop] === undefined) {
      console.debug(`need ${prop.toString()}`)
      Vue.set(obj, prop, '?' + prop.toString() + '?')
    }
    return obj[prop]
  },
  set (obj, prop, value) {
    console.debug(`setting ${prop.toString()} to ${value}`)
    Vue.set(obj, prop, value)
    return true
  }
}

function store (map) {
  return new Proxy(map, handler)
}

export default store
