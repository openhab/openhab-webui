import Vue from 'vue'
import VueRouter from 'vue-router'

import routes from './routes'

import store from '../store'

Vue.use(VueRouter)

const Router = new VueRouter({
  /*
   * NOTE! Change Vue Router mode from quasar.conf.js -> build -> vueRouterMode
   *
   * If you decide to go with "history" mode, please also set "build.publicPath"
   * to something other than an empty string.
   * Example: '/' instead of ''
   */

  // Leave as is and change from quasar.conf.js instead!
  mode: process.env.VUE_ROUTER_MODE,
  base: process.env.VUE_ROUTER_BASE,
  scrollBehavior: () => ({ y: 0 }),
  routes
})

Router.beforeEach((to, from, next) => {
  if (store.state.ready) return next()
  if (to.path.indexOf('/offline') === 0) return next()

  // get the store ready first
  if (navigator.credentials && navigator.credentials.preventSilentAccess) {
    // The new Credential Management API is available
    // try to retrieve previously stored credentials
    navigator.credentials.get({ password: true }).then((creds) => {
      console.log('Using stored credentials to sign in')
      store.dispatch('initialLoad', creds).then(() => next()).catch(() => next('/offline'))
    }).catch(() => {
      store.dispatch('initialLoad').then(() => next()).catch(() => next('/offline'))
    })
  } else {
    store.dispatch('initialLoad').then(() => next()).catch(() => next('/offline'))
  }
})

export default Router
