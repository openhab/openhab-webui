<template>
  <item-picker :label="configDescription.label || 'Item'"
               :value="value"
               @input="updateValue"
               :multiple="configDescription.multiple"
               :required="configDescription.required"
               :filterToggle="!!filter('filterToggle')"
               :filterType="filter('type')"
               :filterGroupType="filter('groupType')"
               :filterTag="filter('tag')" />
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
    filter (filterName) {
      const value = this.configDescription.filterCriteria?.find((f) => f.name === filterName)?.value
      if (typeof value === 'string') {
        if (value.includes(',')) {
          return value.split(',').map((t) => t.trim())
        } else {
          return value.trim()
        }
      }
      return value
    },
    updateValue (value) {
      this.$emit('input', value)
    }
  }
}
</script>
