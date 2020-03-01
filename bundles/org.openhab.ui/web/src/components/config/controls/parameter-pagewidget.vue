<template>
  <ul>
      <f7-list-item
         :title="configDescription.label" smart-select :smart-select-params="smartSelectParams" ref="item">
        <select :name="configDescription.name" @change="updateValue" :multiple="configDescription.multiple">
          <option v-if="!configDescription.required" :value="undefined" :selected="value === null || value === undefined"></option>
          <optgroup v-if="configDescription.context.indexOf('page') >= 0" label="Pages">
            <option v-for="option in $store.getters.pages" :value="'page:' + option.uid" :key="option.uid" :selected="isSelected(option, 'page')">{{option.config.label}}</option>
          </optgroup>
          <optgroup v-if="configDescription.context.indexOf('widget') >= 0" label="Widgets">
            <option v-for="option in $store.getters.widgets" :value="'widget:' + option.uid" :key="option.uid" :selected="isSelected(option, 'widget')">{{option.uid}}</option>
          </optgroup>
        </select>
      </f7-list-item>
  </ul>
</template>

<script>
export default {
  props: ['configDescription', 'value'],
  data () {
    return {
      smartSelectParams: {
        view: (this.$f7) ? this.$f7.view.main : null
      }
    }
  },
  created () {
    this.smartSelectParams.openIn = 'popup'
    this.smartSelectParams.searchbar = true
    this.smartSelectParams.closeOnSelect = !(this.configDescription.multiple)
    if (!this.configDescription.multiple && this.configDescription.required && this.value === undefined) {
      this.$emit('input', this.configDescription.options[0].value)
    }
  },
  methods: {
    updateValue (event) {
      let value = this.$refs.item.f7SmartSelect.getValue()
      if (!this.configDescription.multiple && this.configDescription.type === 'INTEGER') {
        value = parseInt(value)
      }
      this.$emit('input', value)
    },
    isSelected (option, type) {
      if (this.value === null || this.value === undefined) return
      if (!this.configDescription.multiple) {
        return this.value.toString() === type + ':' + option.uid
      } else {
        return this.value && this.value.indexOf(type + ':' + option.uid) >= 0
      }
    }
  }
}
</script>
