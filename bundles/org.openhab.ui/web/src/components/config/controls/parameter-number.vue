<template>
  <ul>
      <f7-list-input
        :name="configDescription.name"
        :label="configDescription.label"
        :floating-label="$theme.md"
        :min="(configDescription.options && configDescription.options.length) ? undefined : configDescription.min"
        :max="(configDescription.options && configDescription.options.length) ? undefined : configDescription.max"
        :step="configDescription.step || (configDescription.type === 'DECIMAL') ? 0.01 : undefined"
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
      return (this.configDescription.type === 'DECIMAL') ? parseFloat(this.value) : parseInt(this.value)
    }
  },
  methods: {
    updateValue (event) {
      const value = (this.configDescription.type === 'DECIMAL') ? parseFloat(event.target.value) : parseInt(event.target.value)
      this.$emit('input', value)
    }
  }
}
</script>
