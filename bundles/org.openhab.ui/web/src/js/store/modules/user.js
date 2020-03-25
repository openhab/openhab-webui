const state = {
  user: null
}

const getters = {
  user: (state) => state.user,
  isAdmin: (state) => state.user && state.user.roles && state.user.roles.indexOf('administrator') >= 0
}

const mutations = {
  setUser (state, { user }) {
    state.user = user
  }
}

export default {
  state,
  getters,
  mutations
}
