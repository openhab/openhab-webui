import Vue from 'vue'

const state = {
  mappings: {},
}

const mutations = {
  setMapping(state, { key, value }) {
    Vue.set(state.mappings, key, value);
  },
  removeItem(state, key) {
    Vue.delete(state.mappings, key);  
  }
}

export default {
  state,
  mutations
}
