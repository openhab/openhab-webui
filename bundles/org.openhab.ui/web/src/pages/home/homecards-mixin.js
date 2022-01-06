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
      modelReady: false
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
    // that has semantics configuration and returns it
    buildPathInModel (item) {
      if (!item.metadata || !item.metadata.semantics) return
      if (item.modelPath) return item.modelPath
      // console.log(`Building path for ${item.name} with semantics ${item.metadata.semantics.config}`)
      let parent = null
      if (item.metadata.semantics.config && item.metadata.semantics.config.isPointOf) {
        parent = (this.items.find((i) => i.name === item.metadata.semantics.config.isPointOf))
      } else if (item.metadata.semantics.config && item.metadata.semantics.config.isPartOf) {
        parent = (this.items.find((i) => i.name === item.metadata.semantics.config.isPartOf))
      } else if (item.metadata.semantics.config && item.metadata.semantics.config.hasLocation) {
        parent = (this.items.find((i) => i.name === item.metadata.semantics.config.hasLocation))
      }
      item.modelPath = parent ? [...this.buildPathInModel(parent), parent] : []
      return item.modelPath
    },
    loadModel (page) {
      this.$oh.api.get('/rest/items?metadata=semantics,listWidget,widgetOrder')
        .then((data) => {
          this.items = data
          // build model path for all model items
          data.forEach((item) => {
            if (item.metadata && item.metadata.semantics) this.buildPathInModel(item)
          })
          // get the location items
          const locations = data.filter((item, index, items) => {
            return item.metadata && item.metadata.semantics &&
              item.metadata.semantics.value.indexOf('Location') === 0
          }).sort(this.compareObjects).map((l) => {
            return {
              item: l,
              properties: data.filter((item, index, items) => {
                return item.metadata && item.metadata.semantics &&
                  item.metadata.semantics && item.metadata.semantics.config &&
                  item.metadata.semantics.config.relatesTo &&
                  item.metadata.semantics.config.hasLocation === l.name
              }).sort(this.compareObjects),
              equipment: data.filter((item, index, items) => {
                return item.metadata && item.metadata.semantics &&
                  item.metadata.semantics && item.metadata.semantics.config &&
                  item.metadata.semantics.value.indexOf('Equipment') === 0 &&
                  item.metadata.semantics.config.hasLocation === l.name
              }).sort(this.compareObjects).map((item) => {
                return {
                  item: item,
                  points: data.filter((item2, index, items) => {
                    return item2.metadata && item2.metadata.semantics &&
                      item2.metadata.semantics && item2.metadata.semantics.config &&
                      item2.metadata.semantics.config.isPointOf === item.name
                  }).sort(this.compareObjects)
                }
              })
            }
          })

          // get the equipment items
          const equipment = data.filter((item, index, items) => {
            return item.metadata && item.metadata.semantics &&
              item.metadata.semantics &&
              item.metadata.semantics.value.indexOf('Equipment') === 0
          }).sort(this.compareObjects).reduce((prev, item, i, properties) => {
            const equipmentType = item.metadata.semantics.value.substring(item.metadata.semantics.value.lastIndexOf('_')).replace('_', '')
            if (!prev[equipmentType]) prev[equipmentType] = []
            const equipmentWithPoints = {
              item: item,
              points: data.filter((item2, index, items) => {
                return item2.metadata && item2.metadata.semantics &&
                  item2.metadata.semantics && item2.metadata.semantics.config &&
                  item2.metadata.semantics.config.isPointOf === item.name
              }).sort(this.compareObjects)
            }
            prev[equipmentType].push(equipmentWithPoints)
            return prev
          }, {})

          // get the property items
          const properties = data.filter((item, index, items) => {
            return item.metadata && item.metadata.semantics &&
              item.metadata.semantics && item.metadata.semantics.config &&
              item.metadata.semantics.config.relatesTo
          }).sort(this.compareObjects).reduce((prev, item, i, properties) => {
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
