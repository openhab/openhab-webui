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
  },
  state: {
    apiEndpoints: null
  },
  getters: {
    apiEndpoint: (state) => (type) => (!state.apiEndpoints) ? null : state.apiEndpoints.links.find((e) => e.type === type)
  },
  mutations: {
    setApiEndpoints (state, { endpoints }) {
      state.apiEndpoints = endpoints
    }
  }
  // strict: debug
})

export default store
