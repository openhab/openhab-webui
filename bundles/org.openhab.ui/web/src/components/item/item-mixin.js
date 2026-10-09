import { isSemanticTag } from '@/components/tags/tag-helpers'

export default {
  methods: {
    /**
     * Save an Item, i.e. add a new Item or update an existing Item.
     * If the Item is an UoM Item, unit metadata is saved as well.
     *
     * If a new Item is created (checks `this.createMode`), and it is an UoM Item, state description (if changed from the default) metadata is also saved.
     *
     * @param item
     * @returns {Promise}
     */
    async saveItem(item) {
      if (item.groupType === 'None') delete item.groupType
      if (item.function === 'None') delete item.groupType

      const unit = item.unit
      delete item.unit
      const stateDescriptionPattern = item.stateDescriptionPattern
      delete item.stateDescriptionPattern

      return this.$oh.api
        .put('/rest/items/' + item.name, item)
        .then(() => {
          return this.saveUnit(item, unit)
        })
        .then(() => {
          return this.saveStateDescription(item, stateDescriptionPattern)
        })
        .catch((err) => {
          return Promise.reject(err)
        })
    },
    saveUnit(item, unit) {
      // Save unit metadata if Item is an UoM Item
      if ((item.type.startsWith('Number:') || item.groupType?.startsWith('Number:')) && unit) {
        const metadata = {
          value: unit,
          config: {}
        }
        return this.saveMetadata(item, 'unit', metadata)
      } else {
        return Promise.resolve()
      }
    },
    saveStateDescription(item, stateDescriptionPattern) {
      // Save state description if Item is an UoM Item
      if ((item.type.startsWith('Number:') || item.groupType?.startsWith('Number:')) && stateDescriptionPattern) {
        const metadata = {
          value: ' ',
          config: {
            pattern: stateDescriptionPattern
          }
        }
        return this.saveMetadata(item, 'stateDescription', metadata)
      } else {
        return Promise.resolve()
      }
    },
    saveMetadata(item, namespace, metadata) {
      return this.$oh.api.put('/rest/items/' + item.name + '/metadata/' + namespace, metadata)
    },
    deleteMetadata(item, namespace) {
      return this.$oh.api.delete('/rest/items/' + item.name + '/metadata/' + namespace)
    }
  }
}
