import Vue from 'vue'
import Vuex from 'vuex'

import components from './modules/components'
import states from './modules/states'
import semantics from './modules/semantics'
import user from './modules/user'
import { convertJavaLocale } from '@/js/i18n'

Vue.use(Vuex)

// const debug = process.env.NODE_ENV !== 'production'

const store = new Vuex.Store({
  modules: {
    components,
    semantics,
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
    apiEndpoint: (state) => (type) => (!state.apiEndpoints) ? null : state.apiEndpoints.find((e) => e.type === type),
    locale: (state, getters) => state.locale ?? 'default'
  },
  mutations: {
    setRootResource (state, { rootResponse }) {
      state.apiVersion = rootResponse.version
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
  },
  actions: {
    loadRootResource ({ commit }, { rootResponse }) {
      commit('setLocale', convertJavaLocale(rootResponse.locale))
      commit('setRootResource', { rootResponse })
    }
  }
  // strict: debug
})

export default store
