<template>
  <f7-range class="oh-slider" v-bind="config" :value="value" @range:changed="onChange" :format-label="formatLabel" :format-scale-label="formatScaleLabel" />
</template>

<style lang="stylus">
.oh-slider
  .range-knob-label
    white-space nowrap
</style>

<script>
import mixin from '../widget-mixin'
import { OhSliderDefinition } from '@/assets/definitions/widgets/system'

export default {
  mixins: [mixin],
  widget: OhSliderDefinition,
  mounted () {
    delete this.config.value
  },
  computed: {
    value () {
      if (this.config.variable) return this.context.vars[this.config.variable]
      const value = this.context.store[this.config.item].state
      // use as a brightness control for HSB values
      if (value.split && value.split(',').length === 3) return parseFloat(value.split(',')[2])
      return parseFloat(value)
    }
  },
  methods: {
    formatLabel (value) {
      return this.toStepFixed(value) + (this.config.unit || '')
    },
    formatScaleLabel (value) {
      return this.toStepFixed(value)
    },
    toStepFixed (value) {
      // uses the number of decimals in the step config to round the provided number
      if (!this.config.step) return value
      const nbDecimals = Number(this.config.step).toString().replace(',', '.').split('.')[1]
      return parseFloat(Number(value).toFixed(nbDecimals))
    },
    onChange (value) {
      const newValue = this.toStepFixed(value)
      if (newValue === this.value) return
      if (this.config.variable) {
        this.$set(this.context.vars, this.config.variable, value)
      } else if (this.config.item) {
        this.$store.dispatch('sendCommand', { itemName: this.config.item, cmd: newValue.toString() })
      }
    }
  }
}
</script>
