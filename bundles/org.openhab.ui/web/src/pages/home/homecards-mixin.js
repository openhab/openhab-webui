import cardGroups from './homecards-grouping'
import { compareItems } from '@/components/widgets/widget-order'
import { loadLocaleMessages } from '@/js/i18n'
import { authorize } from '@/js/openhab/auth'

export default {
  i18n: {
    messages: loadLocaleMessages(require.context('@/assets/i18n/semantics'))
  },
  data () {
    return {
      model: {},
      modelReady: false,
      loopError: null
    }
  },
  computed: {
  },
  methods: {
    cardGroups (type, page) {
      return cardGroups(this.model, type, page)
    },
    compareObjects (o1, o2) {
      return compareItems(o1.item || o1, o2.item || o2)
    },
    buildModelCard (type, source, key, page) {
      const card = (page && page.slots && page.slots[type] && page.slots[type][0] && page.slots[type][0].slots && page.slots[type][0].slots[key]) ? page.slots[type][0].slots[key][0] : null
      switch (type) {
        case 'location':
          let defaultLocationTitle = source.item.label || source.item.name
          return Object.assign(source, {
            key,
            card,
            defaultTitle: defaultLocationTitle
          })
        case 'equipment':
          let defaultEquipmentTitle = this.$t(key)
          return {
            key,
            card,
            defaultTitle: defaultEquipmentTitle,
            equipment: source
          }
        case 'property':
          let defaultPropertyTitle = this.$t(key)
          return {
            key,
            card,
            defaultTitle: defaultPropertyTitle,
            points: source
          }
      }
    },
    // Recursively builds path in model (sorted array of relations to ancestors, either Equipment or Location) for an item
    // that has semantics configuration and returns it.
    // At the same time, adds all items not already processed to the filteredItems property depending on their semantic type.
    buildPathInModel (item, filteredItems) {
      if (!item.metadata || !item.metadata.semantics) return
      if (item.modelPath) return item.modelPath
      let parent = null
      if (item.metadata.semantics.config && item.metadata.semantics.config.hasLocation) {
        parent = (this.items.find((i) => i.name === item.metadata.semantics.config.hasLocation))
      } else if (item.metadata.semantics.config && item.metadata.semantics.config.isPointOf) {
        parent = (this.items.find((i) => i.name === item.metadata.semantics.config.isPointOf))
      } else if (item.metadata.semantics.config && item.metadata.semantics.config.isPartOf) {
        parent = (this.items.find((i) => i.name === item.metadata.semantics.config.isPartOf))
      }
      if (parent && parent.semanticLoopDetector) {
        this.loopError = `A a loop has been detected in the semantic model: ${parent.name} is both descendant and parent of ${item.name}`
        throw this.loopError
      }
      item.semanticLoopDetector = true
      item.modelPath = parent ? [...(this.buildPathInModel(parent, filteredItems)), parent] : []
      delete item.semanticLoopDetector
      item.parent = parent
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
    },
    sortModel (item) {
      item.children = item.children.sort(compareItems)
      item.locations = item.locations.sort(compareItems)
      item.points = item.points.sort(compareItems)
      item.properties = item.properties.sort(compareItems)
      item.equipment = item.equipment.sort(compareItems)
      item.equipmentOrPoints = item.equipmentOrPoints.sort(compareItems)

      item.children.forEach(child => this.sortModel(child))
    },
    loadModel (page) {
      this.$oh.api.get('/rest/items?staticDataOnly=true&metadata=semantics,listWidget,widgetOrder')
        .then((data) => {
          this.items = data
          let filteredItems = {
            equipment: [],
            properties: [],
            locations: []
          }

          // build model path for all model items
          data.forEach((item) => {
            if (item.metadata && item.metadata.semantics) this.buildPathInModel(item, filteredItems)
          })

          // Sort each semantic model item children arrays (start at top-level nodes)
          data.filter((item) => item.modelPath && item.modelPath.length === 0)
            .forEach((item) => this.sortModel(item))

          // get the location items
          const locations = filteredItems.locations.sort(this.compareObjects).map((l) => {
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
          const equipment = filteredItems.equipment.sort(this.compareObjects).reduce((prev, item, i, properties) => {
            const equipmentType = item.metadata.semantics.value.substring(item.metadata.semantics.value.lastIndexOf('_')).replace('_', '')
            if (!prev[equipmentType]) prev[equipmentType] = []
            prev[equipmentType].push(item)
            return prev
          }, {})

          // get the property items
          const properties = filteredItems.properties.sort(this.compareObjects).reduce((prev, item, i, properties) => {
            const property = item.metadata.semantics.config.relatesTo.split('_')[1]
            if (!prev[property]) prev[property] = []
            prev[property].push(item)
            return prev
          }, {})

          this.model.locations = locations.map(l => this.buildModelCard('location', l, l.item.name, page))
          this.model.equipment = Object.keys(equipment).sort((a, b) => this.$t(a).localeCompare(this.$t(b))).map(k => this.buildModelCard('equipment', equipment[k], k, page))
          this.model.properties = Object.keys(properties).sort((a, b) => this.$t(a).localeCompare(this.$t(b))).map(k => this.buildModelCard('property', properties[k], k, page))
          this.modelReady = true
        })
        .catch((err) => {
          console.log('Error while loading model: ' + err)
          if (err === 'Unauthorized' || err === 401) {
            authorize()
          }
        })
    }
  }
}
