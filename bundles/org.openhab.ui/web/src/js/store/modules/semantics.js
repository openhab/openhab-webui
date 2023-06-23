import i18n from '@/js/i18n'
import api from '@/js/openhab/api'

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

const actions = {
  loadSemantics () {
    if (this.getters.apiEndpoint('tags')) {
      api.get('/rest/tags')
        .then((tags) => {
          state.Locations = tags.filter(t => t.uid.startsWith('Location_')).map(t => t.name)
          state.Equipment = tags.filter(t => t.uid.startsWith('Equipment_')).map(t => t.name)
          state.Points = tags.filter(t => t.uid.startsWith('Point_')).map(t => t.name)
          state.Properties = tags.filter(t => t.uid.startsWith('Property_')).map(t => t.name)
          // Store i18n labels
          Object.values(tags).forEach(t => {
            if (t.label) state.Labels[t.name] = t.label
          })
          // Save as i18n messages
          i18n.mergeLocaleMessage(this.getters.locale, state.Labels)

          return Promise.resolve()
        })
        .catch((e) => Promise.reject(e))
    } else {
      return Promise.resolve()
    }
  }
}

const mutations = {}

export default {
  state,
  getters,
  actions,
  mutations
}
