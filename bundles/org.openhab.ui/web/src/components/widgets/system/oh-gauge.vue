<template>
  <f7-gauge v-bind="config" :value="value" :value-text="valueText" />
</template>

<script>
import mixin from '../widget-mixin'
import { OhGaugeDefinition } from '@/assets/definitions/widgets/system'

export default {
  mixins: [mixin],
  widget: OhGaugeDefinition,
  computed: {
    value () {
      if (this.config.variable) return this.context.vars[this.config.variable]
      let value = (this.config.item) ? this.context.store[this.config.item].state : this.config.value
      // use as a brightness indicator for HSB values
      if (value.split && value.split(',').length === 3) value = value.split(',')[2]
      const min = this.config.min || 0
      const max = this.config.max || 100
      const percentageValue = (parseFloat(value.toString()) - min) / (max - min)
      return percentageValue
    },
    valueText () {
      if (this.config.valueText) return this.config.valueText
      if (this.config.item) return this.context.store[this.config.item].displayState || this.context.store[this.config.item].state
      return null
    }
  }
}
</script>
