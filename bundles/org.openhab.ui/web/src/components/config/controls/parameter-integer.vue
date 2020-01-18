<template>
  <ul>
      <f7-list-input
        :name="configDescription.name"
        :label="configDescription.label"
        :floating-label="$theme.md"
        :value="actualValue"
        @input="updateValue"
        :required="configDescription.required" validate
        :clear-button="!configDescription.required"
        type="number" />
  </ul>
</template>

<script>
export default {
  props: ['configDescription', 'value'],
  computed: {
    actualValue () {
      return parseInt(this.value)
    }
  },
  methods: {
    updateValue (event) {
      const value = parseInt(event.target.value)
      this.$emit('input', value)
    }
  }
}
</script>
