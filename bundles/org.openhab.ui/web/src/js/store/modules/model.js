import api from '@/js/openhab/api'
import { authorize } from '@/js/openhab/auth'
import i18n from '@/js/i18n'
import { compareItems } from '@/components/widgets/widget-order'

function compareObjects (o1, o2) {
  return compareItems(o1.item || o1, o2.item || o2)
}

function buildModelCard (type, source, key) {
  switch (type) {
    case 'location':
      let defaultLocationTitle = source.item.label || source.item.name
      return Object.assign(source, {
        key,
        defaultTitle: defaultLocationTitle
      })
    case 'equipment':
      let defaultEquipmentTitle = i18n.t(key)
      return {
        key,
        defaultTitle: defaultEquipmentTitle,
        equipment: source
      }
    case 'property':
      let defaultPropertyTitle = i18n.t(key)
      return {
        key,
        defaultTitle: defaultPropertyTitle,
        points: source
      }
  }
}

// Recursively builds path in model (sorted array of relations to ancestors, either Equipment or Location) for an item
// that has semantics configuration and returns it.
// At the same time, adds all items not already processed to the filteredItems property depending on their semantic type.
function buildPathInModel (item, items, filteredItems) {
  if (!item.metadata || !item.metadata.semantics) return
  if (item.modelPath) return item.modelPath
  let parent = null
  if (item.metadata.semantics.config && item.metadata.semantics.config.hasLocation) {
    parent = (items.find((i) => i.name === item.metadata.semantics.config.hasLocation))
  } else if (item.metadata.semantics.config && item.metadata.semantics.config.isPointOf) {
    parent = (items.find((i) => i.name === item.metadata.semantics.config.isPointOf))
  } else if (item.metadata.semantics.config && item.metadata.semantics.config.isPartOf) {
    parent = (items.find((i) => i.name === item.metadata.semantics.config.isPartOf))
  }
  if (parent && parent.semanticLoopDetector) {
    throw `A a loop has been detected in the semantic model: ${parent.name} is both descendant and parent of ${item.name}`
  }
  item.parent = parent?{ name: parent.name, label: parent.label, metadata: parent.metadata }:null

  item.semanticLoopDetector = true
  item.modelPath = parent ? [...(buildPathInModel(parent, items, filteredItems)), item.parent] : []
  delete item.semanticLoopDetector
  item.children = []
  item.locations = []
  item.points = []
  item.properties = []
  item.equipment = []
  item.equipmentOrPoints = []

  if (parent) parent.children.push(item)

  if (item.metadata.semantics.value.startsWith('Location')) {
    if (parent) parent.locations.push(item)
    filteredItems.locations.push(item)
  }

  if (item.metadata.semantics.value.startsWith('Point')) {
    if (parent) {
      parent.points.push(item)
      parent.equipmentOrPoints.push(item)
    }
  }

  if (item.metadata.semantics.config && item.metadata.semantics.config.relatesTo) {
    if (parent) parent.properties.push(item)
    filteredItems.properties.push(item)
  }

  if (item.metadata.semantics.value.startsWith('Equipment')) {
    if (parent) {
      parent.equipment.push(item)
      parent.equipmentOrPoints.push(item)
    }
    filteredItems.equipment.push(item)
  }

  return item.modelPath
}

function sortModel (item) {
  item.children = item.children.sort(compareItems)
  item.locations = item.locations.sort(compareItems)
  item.points = item.points.sort(compareItems)
  item.properties = item.properties.sort(compareItems)
  item.equipment = item.equipment.sort(compareItems)
  item.equipmentOrPoints = item.equipmentOrPoints.sort(compareItems)

  item.children.forEach(child => sortModel(child))
}

const state = {
  semanticModel : null,
  error : null
}

const getters = {
  semanticModel: (state) => {
    return state.semanticModel
  },
  semanticModelElement: (state) => (key, type) => {
    if (state.semanticModel == null) {
      return null
    }
    return state.semanticModel[type === 'location'?'locations':type === 'equipment'?'equipment':'properties']?.find(e => e.key === key)
  }
}

const mutations = {
  setSemanticModel (state, model) {
    state.semanticModel = model
  },
  setError(state, error) {
    state.error = error
  }
}

const actions = {
  loadSemanticModel (context) {
    console.debug('Loading semantic model and building semantic homepages ...')
    api.get('/rest/items?staticDataOnly=true&metadata=semantics,listWidget,widgetOrder')
      .then((data) => {
        const items = data
        let filteredItems = {
          equipment: [],
          properties: [],
          locations: []
        }

        // build model path for all model items
        data.forEach((item) => {
          if (item.metadata && item.metadata.semantics) buildPathInModel(item, items, filteredItems)
        })

        // Sort each semantic model item children arrays (start at top-level nodes)
        data.filter((item) => item.modelPath && item.modelPath.length === 0)
          .forEach((item) => sortModel(item))

        // get the location items
        const locations = filteredItems.locations.sort(compareObjects).map((l) => {
          return {
            item: l,
            properties: l.points,
            equipment: l.equipment.map((item) => {
              return {
                item: item,
                points: item.points,
                equipment: item.equipment
              }
            })
          }
        })

        // get the equipment items
        const equipment = filteredItems.equipment.sort(compareObjects).reduce((prev, item, i, properties) => {
          const equipmentType = item.metadata.semantics.value.substring(item.metadata.semantics.value.lastIndexOf('_')).replace('_', '')
          if (!prev[equipmentType]) prev[equipmentType] = []
          prev[equipmentType].push(item)
          return prev
        }, {})

        // get the property items
        const properties = filteredItems.properties.sort(compareObjects).reduce((prev, item, i, properties) => {
          const property = item.metadata.semantics.config.relatesTo.split('_')[1]
          if (!prev[property]) prev[property] = []
          prev[property].push(item)
          return prev
        }, {})

        const model = {}
        model.locations = locations.map(l => buildModelCard('location', l, l.item.name))
        model.equipment = Object.keys(equipment).sort((a, b) => i18n.t(a).localeCompare(i18n.t(b))).map(k => buildModelCard('equipment', equipment[k], k))
        model.properties = Object.keys(properties).sort((a, b) => i18n.t(a).localeCompare(i18n.t(b))).map(k => buildModelCard('property', properties[k], k))

        // console.log('model', model)
        context.commit('setSemanticModel', model)
        return Promise.resolve()
      })
      .catch((err) => {
        console.error('Error while loading model: ' + err, err)
        if (err === 'Unauthorized' || err === 401) {
          authorize()
        }
        context.commit('setError', err)
        Promise.reject()
      })
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
