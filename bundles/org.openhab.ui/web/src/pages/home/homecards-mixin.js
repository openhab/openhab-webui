import cardGroups from './homecards-grouping'

import { useModelStore } from '@/js/stores/useModelStore'

export default {
  computed: {
    model: (state) => useModelStore(),
    modelReady: (state) => useModelStore().ready,
    loopError: (state) => useModelStore().error
  },
  methods: {
    cardGroups (type, page) {
      return cardGroups(this.model, type, page)
    }
  }
}
