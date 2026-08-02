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
      @input="(ev) => updateValue(ev.target.value)"
      type="text">
      <template #content-end>
        <div class="padding-right margin-top">
          <f7-button @click="openMapPicker"> <f7-icon f7="placemark" /> Map </f7-button>
        </div>
      </template>
    </f7-list-input>
  </ul>
</template>

<style lang="stylus"></style>

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
    updateValue(position) {
      this.$emit('input', position)
    },
    openMapPicker() {
      const popup = {
        component: LocationPickerPopup
      }

      const router = this.f7router || f7?.views?.main?.router
      if (!router) {
        console.error('Framework7 router not available')
        return
      }

      router.navigate(
        {
          url: 'pick-location',
          route: {
            path: 'pick-location',
            popup
          }
        },
        {
          props: {
            value: this.value,
            title: this.configDescription.label
          }
        }
      )

      f7.once('locationUpdate', this.updateValue)
      f7.once('locationPickerClosed', () => {
        f7.off('locationUpdate', this.updateValue)
      })
    }
  }
}
</script>
