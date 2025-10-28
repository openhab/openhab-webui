<template>
  <ul>
    <f7-list-input
      ref="input"
      type="date"
      :floating-label="theme.md"
      :label="configDescription.label"
      :name="configDescription.name"
      :value="value"
      :required="configDescription.required"
      validate
      @input="updateValue" />
  </ul>
</template>

<script>
import { theme } from 'framework7-vue'

export default {
  props: {
    configDescription: Object,
    value: String
  },
  emits: ['input'],
  setup () {
    return { theme }
  },
  methods: {
    updateValue (event) {
      this.$emit('input', event.target.value)
    }
  }
}
</script>
