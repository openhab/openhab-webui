<template>
  <ul>
    <f7-list-input
      class="parameter-datetime"
      ref="input"
      type="datetime-local"
      :step="step"
      :floating-label="$theme.md"
      :label="configDescription.label"
      :name="configDescription.name"
      :value="value"
      :required="configDescription.required"
      validate
      @input="updateValue" />
  </ul>
</template>

<style lang="stylus">
.parameter-datetime
  input[type="datetime-local"]
    max-width 100% !important
</style>

<script>
export default {
  props: {
    configDescription: Object,
    value: String
  },
  emits: ['input'],
  computed: {
    step () {
      if (this.configDescription.stepsize !== undefined) return this.configDescription.stepsize
      return 60
    }
  },
  methods: {
    updateValue (event) {
      this.$emit('input', event.target.value)
    }
  }
}
</script>
