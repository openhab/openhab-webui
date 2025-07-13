<template>
  <ul>
    <f7-list-item v-for="(day, $idx) in values"
                  :value="day"
                  :key="day"
                  :title="labels[$idx]"
                  checkbox
                  :checked="isSelected(day) ? true : null"
                  @change="evt => select(day, evt.target.checked)" />
  </ul>
</template>

<script>
export default {
  props: {
    configDescription: Object,
    value: [String, Array]
  },
  emits: ['input'],
  data () {
    return {
      labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      values: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
    }
  },
  methods: {
    isSelected (option) {
      if (this.value === null || this.value === undefined) return
      if (!this.configDescription.multiple) {
        return this.value.toString() === option
      } else {
        return this.value && this.value.indexOf(option) >= 0
      }
    },
    select (day, value) {
      const newValuesSet = (this.value) ? new Set([...this.value]) : new Set()
      if (value) newValuesSet.add(day)
      if (!value) newValuesSet.delete(day)
      let newValues = [...newValuesSet].sort((a, b) => this.values.indexOf(a) < this.values.indexOf(b))
      newValues.sort((a, b) => this.values.indexOf(a) - this.values.indexOf(b))
      this.$emit('input', newValues)
    }
  }
}
</script>
