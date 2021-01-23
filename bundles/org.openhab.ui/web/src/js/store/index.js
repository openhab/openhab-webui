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
    apiEndpoint: (state) => (type) => (!state.apiEndpoints) ? null : state.apiEndpoints.find((e) => e.type === type),
    locale: (state, getters) => {
      const javaLocale = (state.locale) ? state.locale : ''
      let jsLocale = ''
      let language = ''
      let country = ''
      let script = ''

      // determine country, language and script
      javaLocale.split('_').forEach(segment => {
        if (segment === segment.toLowerCase() && segment.length === 2) {
          language = segment
        } else if (segment === segment.toUpperCase() && segment.length === 2) {
          country = segment
        } else if (segment.charAt(0) === '#') {
          script = segment.substring(1)
        }
      })

      // assemble js locale string representation
      jsLocale += (language) || jsLocale
      jsLocale += (script) ? `-${script}` : `${script}`
      jsLocale += (country && jsLocale.length > 0) ? `-${country}` : `${country}`

      // check whether the browser support the returned locale
      try {
        new Date().toLocaleDateString(jsLocale)
        return jsLocale
      } catch (e) {
        return 'default'
      }
    }
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
