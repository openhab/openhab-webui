<template>
  <ul>
    <f7-list-input
      :name="configDescription.name"
      :label="configDescription.label"
      :floating-label="$theme.md"
      :min="(configDescription.options && configDescription.options.length) ? undefined : configDescription.min"
      :max="(configDescription.options && configDescription.options.length) ? undefined : configDescription.max"
      :step="step || ((configDescription.type === 'DECIMAL') ? 0.01 : undefined)"
      :value="actualValue"
      @input="updateValue"
      :required="configDescription.required"
      validate
      validate-on-blur
      :clear-button="false"
      type="number" />
  </ul>
</template>

<script>
export default {
  props: {
    configDescription: Object,
    value: [String, Number]
  },
  emits: ['input'],
  computed: {
    actualValue () {
      return (this.configDescription.type === 'DECIMAL') ? parseFloat(this.value) : parseInt(this.value)
    },
    step () {
      if (this.configDescription.stepsize === 0) return 'any'
      return this.configDescription.stepsize
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
