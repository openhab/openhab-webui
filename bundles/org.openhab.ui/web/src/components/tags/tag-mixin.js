export default {
  data () {
    return {
      semanticClasses: this.$store.getters.semanticClasses
    }
  },
  methods: {
    isSemanticTag (tag) {
      return [this.semanticClasses.Locations,
        this.semanticClasses.Equipment,
        this.semanticClasses.Points,
        this.semanticClasses.Properties].some((t) => t.indexOf(tag) >= 0)
    },
    semanticType (tag) {
      if (this.semanticClasses.Locations.indexOf(tag) >= 0) return 'Location'
      if (this.semanticClasses.Equipment.indexOf(tag) >= 0) return 'Equipment'
      if (this.semanticClasses.Points.indexOf(tag) >= 0) return 'Point'
      return ''
    },
    isSemanticPropertyTag (tag) {
      return (this.semanticClasses.Properties.indexOf(tag) >= 0)
    }
  }
}
