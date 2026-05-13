<template>
  <ul>
    <f7-list-item :title="configDescription.label">
      <template #after>
        <f7-toggle :name="configDescription.name" :checked="actualValue ? true : null" :disabled="readOnly" @toggle:change="updateValue" />
      </template>
    </f7-list-item>
  </ul>
</template>

<script>
export default {
  props: {
    configDescription: Object,
    value: [String, Boolean],
    readOnly: Boolean
  },
  emits: ['input'],
  computed: {
    actualValue() {
      if (typeof this.value === 'string') {
        return this.value === 'true'
      }
      return this.value
    }
  },
  methods: {
    updateValue(value) {
      if (this.readOnly) return
      this.$emit('input', value)
    }
  }
}
</script>
