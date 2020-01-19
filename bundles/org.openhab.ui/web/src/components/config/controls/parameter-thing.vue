<template>
  <thing-picker :title="configDescription.label" :value="value" @input="updateValue" />
</template>

<script>
import ThingPicker from './thing-picker.vue'

export default {
  props: ['configDescription', 'value'],
  components: {
    ThingPicker
  },
  methods: {
    updateValue (value) {
      this.$emit('input', value)
    }
  }
}
</script>
