import TagMixin from '@/components/tags/tag-mixin'

export default {
  mixins: [TagMixin],
  methods: {
    getItemTypeAndMetaLabel (item) {
      let ret = item.type
      if (item.type === 'Group') {
        ret += ` (${item.groupType})`
      }
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
      if (!/^[A-Za-z0-9_]+$/.test(name)) {
        return 'Required. A-Z,a-z,0-9,_ only'
      } else if (this.items && this.items.some(item => item.name === name)) {
        return 'An Item with this name already exists'
      }
      return ''
    },
    /**
     * Save an Item, i.e. add a new Item or update an existing Item.
     *
     * If a new Item is created (checks `this.createMode`), and it is an UoM Item, unit metadata and state description (if changed from the default) metadata are saved as well.
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

      // TODO: Add support for saving metadata
      return this.$oh.api.put('/rest/items/' + item.name, item).then(() => {
        // Save unit metadata if Item is an UoM Item
        if (this.createMode && (item.type.startsWith('Number:') || item.groupType?.startsWith('Number:')) && unit) {
          const metadata = {
            value: unit,
            config: {}
          }
          return this.$oh.api.put('/rest/items/' + item.name + '/metadata/unit', metadata)
        }
        return Promise.resolve()
      }).then(() => {
        // Save state description if Item is an UoM Item and if state description changed from the default value
        if (this.createMode && (item.type.startsWith('Number:') || item.groupType?.startsWith('Number:')) && stateDescriptionPattern) {
          if (stateDescriptionPattern !== '%.0f %unit%') {
            const metadata = {
              value: ' ',
              config: {
                pattern: stateDescriptionPattern
              }
            }
            return this.$oh.api.put('/rest/items/' + item.name + '/metadata/stateDescription', metadata)
          }
        }
        return Promise.resolve()
      }).catch((err) => {
        return Promise.reject(err)
      })
    }
  }
}
