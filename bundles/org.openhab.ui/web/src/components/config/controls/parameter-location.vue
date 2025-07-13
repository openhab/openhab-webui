<template>
  <ul>
    <f7-list-input
      :floating-label="theme.md"
      :label="configDescription.label"
      :name="configDescription.name"
      :value="value"
      :placeholder="placeholder"
      :required="configDescription.required"
      validate
      :clear-button="!configDescription.required"
      @input="ev => updateValue(ev.target.value)"
      type="text">
      <template #slot-content-end>
        <div class="padding-left">
          <f7-button @click="openMapPicker">
            <f7-icon f7="placemark" /> Map
          </f7-button>
        </div>
      </template>
    </f7-list-input>
  </ul>
</template>

<style lang="stylus">
</style>

<script>
import { f7, theme } from 'framework7-vue'
import LocationPickerPopup from './location-picker-popup.vue'

export default {
  props: {
    configDescription: Object,
    value: String,
    placeholder: String,
    f7router: Object
  },
  emits: ['input'],
  setup: () => {
    return { theme }
  },
  methods: {
    updateValue (position) {
      this.$emit('input', position)
    },
    openMapPicker () {
      const popup = {
        component: LocationPickerPopup
      }

      this.f7router.navigate({
        url: 'pick-location',
        route: {
          path: 'pick-location',
          popup
        }
      }, {
        props: {
          value: this.value,
          title: this.configDescription.label
        }
      })

      f7.once('locationUpdate', this.updateValue)
      f7.once('locationPickerClosed', () => {
        f7.off('locationUpdate', this.updateValue)
      })
    }
  }
}
</script>
