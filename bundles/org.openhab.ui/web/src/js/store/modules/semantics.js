import i18n from '@/js/i18n'
import api from '@/js/openhab/api'

const state = {
  Locations: [],
  Equipment: [],
  Points: [],
  Properties: [],
  Labels: {},
  Tags: []
}

const getters = {
  semanticClasses: (state) => {
    return state
  }
}

const mutations = {
  setSemantics (state, { tags }) {
    state.Tags = tags
    state.Tags.forEach((tag) => {
      const tagParts = tag.uid.split('_')
      tag.parent = tagParts.slice(0, -1).join('_')
    })
    state.Locations = tags.filter(t => t.uid.startsWith('Location')).map(t => t.name)
    state.Equipment = tags.filter(t => t.uid.startsWith('Equipment')).map(t => t.name)
    state.Points = tags.filter(t => t.uid.startsWith('Point')).map(t => t.name)
    state.Properties = tags.filter(t => t.uid.startsWith('Property')).map(t => t.name)
    // Clear existing labels, descriptions & synonyms
    state.Labels = {}
    state.Descriptions = {}
    state.Synonyms = {}
    // Store labels, descriptions & synonyms
    for (const i in tags) {
      const t = tags[i]
      state.Labels[t.name] = t.label || t.name
      state.Descriptions[t.name] = t.description || ''
      state.Synonyms[t.name] = t.synonyms || []
    }
    // Save labels as i18n messages
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
