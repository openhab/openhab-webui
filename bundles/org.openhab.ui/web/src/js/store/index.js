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
    apiVersion: null,
    apiEndpoints: null,
    locale: null,
    runtimeInfo: null,
    developerSidebar: false
  },
  getters: {
    apiEndpoint: (state) => (type) => (!state.apiEndpoints) ? null : state.apiEndpoints.find((e) => e.type === type)
  },
  mutations: {
    setRootResource (state, { rootResponse }) {
      state.apiVersion = rootResponse.version
      state.locale = rootResponse.locale
      state.runtimeInfo = rootResponse.runtimeInfo
      state.apiEndpoints = rootResponse.links
    },
    setLocale (state, locale) {
      state.locale = locale
    },
    setDeveloperSidebar (state, value) {
      state.developerSidebar = value
      state.states.keepConnectionOpen = value
    }
  }
  // strict: debug
})

export default store
