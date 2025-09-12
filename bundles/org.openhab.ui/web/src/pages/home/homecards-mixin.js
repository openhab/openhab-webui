import cardGroups from './homecards-grouping'

import { useModelStore } from '@/js/stores/useModelStore'

export default {
  computed: {
    model: () => useModelStore(),
    modelReady: () => useModelStore().ready,
    loopError: () => useModelStore().error
  },
  methods: {
    cardGroups (type, page) {
      return cardGroups(this.model, type, page)
    }
  }
}
