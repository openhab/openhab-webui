<template>
  <item-picker :title="configDescription.label || 'Item'" :value="value" @input="updateValue" />
</template>

<script>
import ItemPicker from './item-picker.vue'

export default {
  props: ['configDescription', 'value'],
  components: {
    ItemPicker
  },
  methods: {
    updateValue (value) {
      this.$emit('input', value)
    }
  }
}
</script>
