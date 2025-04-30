import i18n from '@/js/i18n'
import api from '@/js/openhab/api'

const state = {
  Locations: {},
  Equipment: {},
  Points: {},
  Properties: {},
  Tags: {} // all tag objects
}

const getters = {
  semanticClasses: (state) => {
    return state
  }
}

const mutations = {
  setSemantics (state, { tags }) {
    state.Locations = {}
    state.Equipment = {}
    state.Points = {}
    state.Properties = {}
    state.Tags = {}
    const labels = {}
    tags.forEach(t => {
      const type = t.uid.split('_')[0]
      if (type === 'Location') {
        state.Locations[t.name] = t
      } else if (type === 'Equipment') {
        state.Equipment[t.name] = t
      } else if (type === 'Point') {
        state.Points[t.name] = t
      } else if (type === 'Property') {
        state.Properties[t.name] = t
      }
      state.Tags[t.name] = t
      t.label = t.label || t.name
      t.type = type
      labels[t.name] = t.label
    })
    // Save as i18n messages
    i18n.mergeLocaleMessage(i18n.locale, labels)
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
