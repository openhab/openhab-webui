<template>
  <ul>
      <f7-list-item
         :title="configDescription.label" smart-select :smart-select-params="{ view: $f7.views.main, openIn: 'popover', multiple: configDescription.multiple, closeOnSelect: !configDescription.multiple }" ref="item">
        <select :name="configDescription.name" @change="updateValue" :multiple="configDescription.multiple">
          <option v-for="(day, $idx) in values" :value="day" :key="day" :selected="isSelected(day)">{{labels[$idx]}}</option>
        </select>
      </f7-list-item>
  </ul>
</template>

<script>
export default {
  props: ['configDescription', 'value'],
  data () {
    return {
      labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      values: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
    }
  },
  methods: {
    updateValue (event) {
      let value = this.$refs.item.f7SmartSelect.getValue()
      this.$emit('input', value)
    },
    isSelected (option) {
      if (this.value === null || this.value === undefined) return
      if (!this.configDescription.multiple) {
        return this.value.toString() === option
      } else {
        return this.value && this.value.indexOf(option) >= 0
      }
    }
  }
}
</script>
