const state = {
  user: null,
  noAuth: false
}

const getters = {
  user: (state) => state.user,
  noAuth: (state) => state.noAuth,
  isAdmin: (state) => state.noAuth || (state.user && state.user.roles && state.user.roles.indexOf('administrator') >= 0)
}

const mutations = {
  setUser (state, { user }) {
    state.user = user
  },
  setNoAuth (state, value) {
    state.noAuth = value
  }
}

export default {
  state,
  getters,
  mutations
}
