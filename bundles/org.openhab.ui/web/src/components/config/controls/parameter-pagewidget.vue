<template>
  <ul>
    <f7-list-item
      :title="configDescription.label"
      smart-select
      :smart-select-params="smartSelectParams"
      ref="item">
      <select :name="configDescription.name"
              @change="updateValue"
              :multiple="configDescription.multiple"
              :required="configDescription.required">
        <option v-if="!configDescription.required" :value="undefined" :selected="value === null || value === undefined ? true : null" />
        <optgroup v-if="configDescription.context.indexOf('page') >= 0" label="Pages">
          <option v-for="option in componentsStore.pages()"
                  :value="'page:' + option.uid"
                  :key="option.uid"
                  :selected="isSelected(option, 'page') ? true : null">
            {{ option.config.label }}
          </option>
        </optgroup>
        <optgroup v-if="configDescription.context.indexOf('widget') >= 0" label="Widgets">
          <option v-for="option in componentsStore.widgets()"
                  :value="'widget:' + option.uid"
                  :key="option.uid"
                  :selected="isSelected(option, 'widget') ? true : null">
            {{ option.uid }}
          </option>
        </optgroup>
      </select>
    </f7-list-item>
  </ul>
</template>

<script>
import { f7 } from 'framework7-vue'
import { useComponentsStore } from '@/js/stores/useComponentsStore'
import { mapStores } from 'pinia'

export default {
  props: {
    configDescription: Object,
    value: [String, Array]
  },
  emits: ['input'],
  data () {
    return {
      smartSelectParams: {
        view: (f7) ? f7.view.main : null
      }
    }
  },
  computed: {
    ...mapStores(useComponentsStore)
  },
  created () {
    this.smartSelectParams.openIn = 'popup'
    this.smartSelectParams.searchbar = true
    this.smartSelectParams.closeOnSelect = !this.configDescription.multiple
    if (!this.configDescription.multiple && this.configDescription.required && this.value === undefined) {
      this.$emit('input', this.configDescription.options[0].value)
    }
  },
  methods: {
    updateValue (event) {
      f7.input.validateInputs(this.$refs.item.$el)
      let value = this.$refs.item.$el.children[0].f7SmartSelect.getValue()
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
