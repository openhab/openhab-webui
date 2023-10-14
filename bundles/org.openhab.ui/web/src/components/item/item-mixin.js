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
    doSave (item) {
      console.log(item)

      if (item.groupType === 'None') delete item.groupType
      if (item.function === 'None') delete item.groupType

      const unit = item.unit
      delete item.unit
      const stateDescriptionPattern = item.stateDescriptionPattern
      delete item.stateDescriptionPattern

      // TODO: Add support for saving metadata
      return this.$oh.api.put('/rest/items/' + item.name, item).then(() => {
        let unitPromise = Promise.resolve()
        if (this.createMode && (item.type.startsWith('Number:') || item.groupType?.startsWith('Number:')) && unit) {
          const metadata = {
            value: unit,
            config: {}
          }
          unitPromise = this.$oh.api.put('/rest/items/' + item.name + '/metadata/unit', metadata)
        }
        return unitPromise
      }).then(() => {
        let stateDescriptionPromise = Promise.resolve()
        if (this.createMode && (item.type.startsWith('Number:') || item.groupType?.startsWith('Number:')) && stateDescriptionPattern) {
          if (stateDescriptionPattern !== `%.0f ${unit}`) {
            const metadata = {
              value: ' ',
              config: {
                pattern: stateDescriptionPattern
              }
            }
            stateDescriptionPromise = this.$oh.api.put('/rest/items/' + item.name + '/metadata/stateDescription', metadata)
          }
        }
        return stateDescriptionPromise
      }).then(() => {
        return Promise.resolve()
      }).catch((err) => {
        return Promise.reject(err)
      })
    }
  }
}
