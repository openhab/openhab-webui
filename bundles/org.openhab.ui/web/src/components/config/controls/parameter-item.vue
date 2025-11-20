<template>
  <item-picker :label="configDescription.label || 'Item'"
               :value="value"
               @input="updateValue"
               :multiple="configDescription.multiple"
               :required="configDescription.required"
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
      const values = this.configDescription.filterCriteria?.find((f) => f.name === filterName)?.value
      if (values) return values.split(',').map((t) => t.trim())
      return null
    },
    updateValue (value) {
      this.$emit('input', value)
    }
  }
}
</script>
