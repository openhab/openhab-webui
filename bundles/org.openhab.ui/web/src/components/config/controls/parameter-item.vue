<template>
  <item-picker :label="configDescription.label || 'Item'"
               :value="value"
               @input="updateValue"
               :multiple="configDescription.multiple"
               :required="configDescription.required" />
</template>

<script>
import ItemPicker from './item-picker.vue'

export default {
  props: {
    configDescription: Object,
    value: [String, Array]
  },
  components: {
    ItemPicker
  },
  emits: ['input'],
  methods: {
    updateValue (value) {
      this.$emit('input', value)
    }
  }
}
</script>
