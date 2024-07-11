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
    }
  }
}
