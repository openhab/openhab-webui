const state = {
  Locations: [],
  Equipment: [],
  Points: [],
  Properties: [],
  Labels: {}
}

const getters = {
  semanticClasses: (state) => {
    return state
  }
}

const mutations = {
  setSemanticClasses (state, { tags }) {
    state.Locations = tags.Locations.map(t => t.name)
    state.Equipment = tags.Equipments.map(t => t.name)
    state.Points = tags.Points.map(t => t.name)
    state.Properties = tags.Properties.map(t => t.name)
    const labels = {}
    Object.values(tags).forEach(ctg => ctg.forEach(t => {
      if (t.label) labels[t.name] = t.label
    }))
    const locale = this.getters.locale
    state.Labels = { [locale]: labels }
  }
}

export default {
  state,
  getters,
  mutations
}
