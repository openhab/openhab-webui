import TagMixin from '@/components/tags/tag-mixin'

export default {
  mixins: [TagMixin],
  methods: {
    getItemTypeAndMetaLabel (item) {
      let ret = item.type
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
    }
  }
}
