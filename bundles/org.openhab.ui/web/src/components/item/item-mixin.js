import TagMixin from '@/components/tags/tag-mixin'

export default {
  mixins: [TagMixin],
  methods: {
    getItemTypeLabel (item) {
      let ret = item.type
      if (item.type === 'Group' && item.groupType) {
        ret += ` (${item.groupType}`
        if (item.function.name) {
          ret += `:${item.function.name}`
          if (item.function.params) ret += `(${item.function.params.join(',')})`
        }
        ret += ')'
      }
      return ret
    },
    getItemTypeAndMetaLabel (item) {
      let ret = this.getItemTypeLabel(item)
      if (item.metadata && item.metadata.semantics) {
        ret += ' · '
        const classParts = item.metadata.semantics.value.split('_')
        ret += classParts[0]
        if (classParts.length > 1) {
          ret += ' > ' + classParts.pop()
          if (item.metadata.semantics.config && item.metadata.semantics.config.relatesTo) {
            const relatesToParts = item.metadata.semantics.config.relatesTo.split('_')
            if (relatesToParts.length > 1) {
              ret += ' > ' + relatesToParts.pop()
            }
          }
        }
      }
      return ret
    },
    getNonSemanticTags (item) {
      if (!item.tags) return []
      return item.tags.filter((t) => !this.isSemanticTag(t))
    },
    /**
     * Validate the Item name against valid characters and (if existing Items are available on `this.items`) names of existing Items.
     *
     * @param {string} name Item name to validate
     * @returns {string} The error message if the name is invalid, or an empty string if the name is valid.
     */
    validateItemName (name) {
      if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(name)) {
        return 'Required. Must not start with a number. A-Z,a-z,0-9,_ only'
      } else if (this.items && this.items.some(item => item.name === name)) {
        return 'An Item with this name already exists'
      }
      return ''
    },
    /**
     * Save an Item, i.e. add a new Item or update an existing Item.
     * If the Item is an UoM Item, unit metadata is saved as well.
     *
     * If a new Item is created (checks `this.createMode`), and it is an UoM Item, state description (if changed from the default) metadata is also saved.
     *
     * @param item
     * @returns {Promise}
     */
    saveItem (item) {
      if (item.groupType === 'None') delete item.groupType
      if (item.function === 'None') delete item.groupType

      const unit = item.unit
      delete item.unit
      const stateDescriptionPattern = item.stateDescriptionPattern
      delete item.stateDescriptionPattern

      return this.$oh.api.put('/rest/items/' + item.name, item).then(() => {
        return this.saveUnit(item, unit)
      }).then(() => {
        return this.saveStateDescription(item, stateDescriptionPattern)
      }).catch((err) => {
        return Promise.reject(err)
      })
    },
    saveUnit (item, unit) {
      // Save unit metadata if Item is an UoM Item
      if ((item.type.startsWith('Number:') || item.groupType?.startsWith('Number:')) && unit) {
        const metadata = {
          value: unit,
          config: {}
        }
        return this.saveMetaData(item, 'unit', metadata)
      } else {
        return Promise.resolve()
      }
    },
    saveStateDescription (item, stateDescriptionPattern) {
      // Save state description if Item is an UoM Item
      if ((item.type.startsWith('Number:') || item.groupType?.startsWith('Number:')) && stateDescriptionPattern) {
        const metadata = {
          value: ' ',
          config: {
            pattern: stateDescriptionPattern
          }
        }
        return this.saveMetaData(item, 'stateDescription', metadata)
      } else {
        return Promise.resolve()
      }
    },
    saveMetaData (item, value, metadata) {
      return this.$oh.api.put('/rest/items/' + item.name + '/metadata/' + value, metadata)
    }
  }
}
