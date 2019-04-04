import jexl from 'jexl'
import AsyncComputed from 'vue-async-computed'

export default ({ app, router, store, Vue }) => {
  Vue.use(AsyncComputed)
  Vue.prototype.$jexl = jexl

  jexl.addTransform('number', (val) => {
    return parseFloat(val)
  })

  Vue.prototype.$expr = (value, context) => {
    if (!value) return null
    if (!context) context = { items: store.getters['items/allStates'] }
    if (value.startsWith('=')) {
      try {
        return jexl.eval(value.substring(1), context).then((res) => {
          return res
        }).catch((e) => {
          return 'Error: ' + e.message
        })
      } catch (e) {
        return e
      }
    } else {
      return value
    }
  }
}
