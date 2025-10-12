<template>
  <ul>
    <f7-list-input
      :floating-label="$theme.md"
      :label="configDescription.label"
      :name="configDescription.name"
      :value="value"
      :placeholder="placeholder"
      :required="configDescription.required"
      validate
      :clear-button="!configDescription.required"
      @input="(ev) => updateValue(ev.target.value)"
      type="text">
      <div class="padding-left" slot="content-end">
        <f7-button slot="content-end" @click="openMapPicker">
          <f7-icon f7="placemark" /> Map
        </f7-button>
      </div>
    </f7-list-input>
  </ul>
</template>

<style lang="stylus">
</style>

<script>
import LocationPickerPopup from './location-picker-popup.vue'

export default {
  props: {
    configDescription: Object,
    value: String,
    placeholder: String
  },
  emits: ['input'],
  methods: {
    updateValue (position) {
      this.$emit('input', position)
    },
    openMapPicker () {
      const popup = {
        component: LocationPickerPopup
      }

      this.$f7router.navigate({
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

      this.$f7.once('locationUpdate', this.updateValue)
      this.$f7.once('locationPickerClosed', () => {
        this.$f7.off('locationUpdate', this.updateValue)
      })
    }
  }
}
</script>
