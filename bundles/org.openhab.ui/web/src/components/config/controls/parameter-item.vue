<template>
  <item-picker :label="configDescription.label || 'Item'"
               :value="value"
               @input="updateValue"
               :multiple="configDescription.multiple"
               :required="configDescription.required"
               :filterType="filterType"
               :filterTag="filterTag" />
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
  computed: {
    filterType () {
      const types = this.configDescription.filterCriteria?.find((f) => f.name === 'type')?.value
      if (types) return types.split(',').map((t) => t.trim())
      return null
    },
    filterTag () {
      const tags = this.configDescription.filterCriteria?.find((f) => f.name === 'tag')?.value
      if (tags) return tags.split(',').map((t) => t.trim())
      return null
    }
  },
  emits: ['input'],
  methods: {
    updateValue (value) {
      this.$emit('input', value)
    }
  }
}
</script>
