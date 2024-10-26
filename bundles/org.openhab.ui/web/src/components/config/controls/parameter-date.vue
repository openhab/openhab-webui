<template>
  <ul>
    <f7-list-input
      ref="input"
      type="date"
      :floating-label="$theme.md"
      :label="configDescription.label"
      :name="configDescription.name"
      :value="value"
      :required="configDescription.required" validate
      @input="updateValue" />
  </ul>
</template>

<script>
export default {
  props: ['configDescription', 'value'],
  methods: {
    updateValue (event) {
      this.$emit('input', event.target.value)
    }
  }
}
</script>
