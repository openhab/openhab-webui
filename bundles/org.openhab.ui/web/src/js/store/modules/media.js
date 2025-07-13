import Vue from 'vue'

const state = {
  mappings: {},
  currentGlobalPlayerName: localStorage.getItem('currentGlobalPlayerName') || 'aa',
  currentGlobalPlayerItem: localStorage.getItem('currentGlobalPlayerItem') || 'aa'
}

const mutations = {
  setMapping (state, { key, value }) {
    Vue.set(state.mappings, key, value)
  },
  removeItem (state, key) {
    Vue.delete(state.mappings, key)
  },
  setCurrentGlobalPlayerName(state,  playerName) {
    state.currentGlobalPlayerName = playerName
    localStorage.setItem('currentGlobalPlayerName', playerName)
  },
  setCurrentGlobalPlayerItem(state,  playerItem) {
    state.currentGlobalPlayerItem = playerItem
    localStorage.setItem('currentGlobalPlayerItem', playerItem)
  }
  
}

export default {
  state,
  mutations
}
