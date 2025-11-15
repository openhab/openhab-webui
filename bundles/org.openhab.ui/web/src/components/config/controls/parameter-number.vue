<template>
  <ul>
    <f7-list-input
      :name="configDescription.name"
      :label="configDescription.label"
      :floating-label="theme.md"
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
import { theme } from 'framework7-vue'

export default {
  props: {
    configDescription: Object,
    value: [String, Number]
  },
  emits: ['input'],
  setup () {
    return { theme }
  },
  computed: {
    actualValue () {
      return (this.configDescription.type === 'DECIMAL') ? parseFloat(this.value) : parseInt(this.value)
    },
    step () {
      let result = this.configDescription.step || this.configDescription.stepsize
      return result === 0 ? 'any' : result
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
