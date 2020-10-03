<template>
  <f7-range v-bind="config" :value="value" @range:changed="onChange" />
</template>

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
    onChange (value) {
      if (value === this.value) return
      if (this.config.variable) {
        this.$set(this.context.vars, this.config.variable, value)
      } else if (this.config.item) {
        this.$store.dispatch('sendCommand', { itemName: this.config.item, cmd: value.toString() })
      }
    }
  }
}
</script>
