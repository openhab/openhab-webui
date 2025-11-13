<template>
  <thing-picker :title="configDescription.label"
                :value="value"
                @input="updateValue"
                :filter-uid="configDescription.options ? configDescription.options.map((o) => o.value) : undefined"
                :multiple="configDescription.multiple"
                :required="configDescription.required" />
</template>

<script>
import ThingPicker from './thing-picker.vue'

export default {
  props: {
    configDescription: Object,
    value: [String, Array]
  },
  emits: ['input'],
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
