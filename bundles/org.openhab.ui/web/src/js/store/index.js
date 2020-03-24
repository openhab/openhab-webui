import Vue from 'vue'
import Vuex from 'vuex'

import components from './modules/components'
import states from './modules/states'
import user from './modules/user'

Vue.use(Vuex)

// const debug = process.env.NODE_ENV !== 'production'

const store = new Vuex.Store({
  modules: {
    components,
    states,
    user
  }
  // strict: debug
})

export default store
