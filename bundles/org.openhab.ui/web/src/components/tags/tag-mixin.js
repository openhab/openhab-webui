import { useSemanticsStore } from '@/js/stores/useSemanticsStore'

export default {
  methods: {
    isSemanticTag (tag) {
      return [
        useSemanticsStore().Locations,
        useSemanticsStore().Equipment,
        useSemanticsStore().Points,
        useSemanticsStore().Properties
      ].some((t) => t.indexOf(tag) >= 0)
    },
    semanticType (tag) {
      if (useSemanticsStore().Locations.indexOf(tag) >= 0) return 'Location'
      if (useSemanticsStore().Equipment.indexOf(tag) >= 0) return 'Equipment'
      if (useSemanticsStore().Points.indexOf(tag) >= 0) return 'Point'
      return ''
    },
    isSemanticPropertyTag (tag) {
      return useSemanticsStore().Properties.indexOf(tag) >= 0
    }
  }
}
