import Vue from 'vue'
import Vuex from 'vuex'

import items from './items'
import cards from './cards'

import state from './state'
import * as actions from './actions'
import * as mutations from './mutations'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    items,
    cards
  },
  state,
  actions,
  mutations
})

export default store

// store.dispatch('items/initialLoad').then(() => {
//   store.dispatch('items/watchEvents')
//   console.log('items loaded')
// })
