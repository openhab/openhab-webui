<template>
  <ul v-if="!inlineList">
    <f7-list-item
      :title="configDescription.label"
      smart-select
      :smart-select-params="smartSelectParams"
      ref="item">
      <select :name="configDescription.name"
              @change="updateValue"
              :multiple="configDescription.multiple"
              :required="configDescription.required">
        <option v-if="!configDescription.required && !configDescription.multiple" :value="undefined" :selected="value === null || value === undefined" />
        <option v-for="option in configDescription.options"
                :value="option.value"
                :key="option.value"
                :selected="isSelected(option) ? true : null">
          {{ option.label }}
        </option>
      </select>
    </f7-list-item>
  </ul>
  <ul v-else>
    <f7-block-header class="no-margin">
      <div class="margin-horizontal item-label"
           style="padding-top: var(--f7-list-item-padding-vertical); color: var(--f7-text-color)">
        {{ configDescription.label }}
      </div>
      <f7-link
        v-if="value"
        :style="{
          top: '1rem',
          float: 'right',
          visibility: configDescription.required ? 'hidden' : 'visible',
          opacity: configDescription.required ? 0 : 1,
          cursor: 'pointer',
          pointerEvents: 'initial'
        }"
        class="input-clear-button margin-right"
        @click="updateValue(undefined)" />
    </f7-block-header>
    <f7-list-item radio
                  v-for="option in configDescription.options"
                  no-hairline
                  :value="option.value"
                  :checked="isSelected(option) ? true : null"
                  radio-icon="start"
                  @change="(!configDescription.required && isSelected(option)) ? updateValue(undefined) : updateValue(option.value)"
                  :key="option.value"
                  :title="option.label"
                  :name="configDescription.name" />
  </ul>
</template>

<script>
import { f7, theme } from 'framework7-vue'

export default {
  props: {
    configDescription: Object,
    value: [String, Array]
  },
  emits: ['input'],
  data () {
    return {
      inlineList: false,
      smartSelectParams: {
        view: (f7) ? f7.view.main : null
      }
    }
  },
  created () {
    if (this.configDescription.options.length <= 5 && !this.configDescription.multiple) {
      this.inlineList = true
    } else if (this.configDescription.options.length <= 10) {
      this.smartSelectParams.openIn = (this.configDescription.options.some((o) => o.label.length > 25)) ? 'sheet' : 'popover'
    } else if (this.configDescription.options.length > 100) {
      this.smartSelectParams.openIn = 'popup'
      this.smartSelectParams.searchbar = true
      this.smartSelectParams.virtualList = true
      if (theme.aurora) this.smartSelectParams.virtualListHeight = 32
    } else {
      this.smartSelectParams.openIn = 'popup'
      this.smartSelectParams.searchbar = true
    }
    this.smartSelectParams.closeOnSelect = !(this.configDescription.multiple)
    // this.smartSelectParams.routableModals = false // to fix bug on firefox
    if (!this.configDescription.multiple && this.configDescription.required && this.value === undefined) {
      this.$emit('input', this.configDescription.options[0].value)
    }
  },
  methods: {
    updateValue (evt) {
      let value = (this.inlineList) ? evt : this.$refs.item.$el.children[0].f7SmartSelect.getValue()
      if (!this.configDescription.multiple && this.configDescription.type === 'INTEGER') {
        value = parseInt(value)
      }
      this.$emit('input', value)
    },
    isSelected (option) {
      if (this.value === null || this.value === undefined) return
      if (!this.configDescription.multiple) {
        return this.value.toString() === option.value
      } else {
        if (this.configDescription.type === 'INTEGER') {
          return this.value && this.value.indexOf(parseInt(option.value)) >= 0
        } else {
          return this.value && this.value.indexOf(option.value) >= 0
        }
      }
    }
  }
}
</script>
