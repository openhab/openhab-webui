import i18n from '@/js/i18n'

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
    // Store i18n labels
    Object.values(tags).forEach(ctg => ctg.forEach(t => {
      if (t.label) state.Labels[t.name] = t.label
    }))
    // Save as i18n messages
    i18n.mergeLocaleMessage(this.getters.locale, state.Labels)
  }
}

export default {
  state,
  getters,
  mutations
}
