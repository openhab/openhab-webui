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

const mutations = {
  setSemantics (state, { tags }) {
    state.Locations = tags.filter(t => t.uid.startsWith('Location')).map(t => t.name)
    state.Equipment = tags.filter(t => t.uid.startsWith('Equipment')).map(t => t.name)
    state.Points = tags.filter(t => t.uid.startsWith('Point')).map(t => t.name)
    state.Properties = tags.filter(t => t.uid.startsWith('Property')).map(t => t.name)
    // Store i18n labels
    state.Labels = {} // Clear existing labels
    for (const i in tags) {
      const t = tags[i]
      state.Labels[t.name] = t.label || t.name
    }
    // Save as i18n messages
    i18n.mergeLocaleMessage(i18n.locale, state.Labels)
  }
}

const actions = {
  loadSemantics (context) {
    console.debug('Loading semantic tags ...')
    if (this.getters.apiEndpoint('tags')) {
      return api.get('/rest/tags')
        .then((tags) => {
          context.commit('setSemantics', { tags })
          console.debug('Successfully loaded semantic tags.')
          return Promise.resolve()
        })
        .catch((e) => {
          console.error('Failed to load semantic tags:')
          console.error(e)
          Promise.reject('Failed to load semantic tags: ' + e)
        })
    } else {
      return Promise.resolve()
    }
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
