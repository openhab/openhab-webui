export default {
  methods: {
  },
  computed: {
    itemFormats () {
      return this.items.map((itemName) => {
        let item = this.$store.getters['items/name'](itemName)
        if (item.stateDescription && item.stateDescription.pattern) {
          return item.stateDescription.pattern
        } else {
          return null
        }
      })
    },
    itemLabels () {
      return this.items.map((itemName) => {
        let item = this.$store.getters['items/name'](itemName)
        return item.label || item.name
      })
    }
  }
}
