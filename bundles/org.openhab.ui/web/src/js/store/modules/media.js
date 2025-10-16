import { set } from 'lodash'
import Vue from 'vue'

const state = {
  mappings: {},
  currentGlobalPlayerName: localStorage.getItem('currentGlobalPlayerName'),
  currentGlobalPlayerItem: localStorage.getItem('currentGlobalPlayerItem'),
  mediaBrowserMode: localStorage.getItem('mediaBrowserMode'),
  playerItem: localStorage.getItem('playerItem')
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
  },
  setMediaBrowserMode(state,  mode) {
    state.mediaBrowserMode = mode
    localStorage.setItem('mediaBrowserMode', mode)
  },
  setPlayerItem(state,  playerItem) {
    state.playerItem = playerItem
    localStorage.setItem('playerItem', playerItem)
  }
  
}

export default {
  state,
  mutations
}
