export default {
  methods: {
    isSemanticTag (tag) {
      return !!this.$store.state.semantics.Tags[tag]
    }
  }
}
