const state = {
  widgets: [],
  pages: []
}

const getters = {
  widget: (state) => (uid) => {
    return state.widgets.find((c) => c.uid === uid)
  },
  widgets: (state) => {
    return [...state.widgets].sort((a, b) => a.uid.localeCompare(b.uid))
  },
  page: (state) => (uid) => {
    return state.pages.find((c) => c.uid === uid)
  },
  pages: (state) => {
    return [...state.pages].sort((a, b) => a.config.label.localeCompare(b.config.label))
  }
}

const mutations = {
  setWidgets (state, { widgets }) {
    state.widgets = widgets
  },

  setPages (state, { pages }) {
    state.pages = pages
  }
}

export default {
  state,
  getters,
  mutations
}
