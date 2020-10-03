<template>
  <f7-stepper ref="stepper" v-bind="config" @stepper:change="onChange"
   manual-input-mode />
</template>

<script>
import mixin from '../widget-mixin'
import { OhStepperDefinition } from '@/assets/definitions/widgets/system'

export default {
  mixins: [mixin],
  widget: OhStepperDefinition,
  mounted () {
    delete this.config.value
  },
  computed: {
    value () {
      if (this.config.variable) return this.context.vars[this.config.variable]
      const value = parseFloat(this.context.store[this.config.item].state)
      return value
    }
  },
  watch: {
    value (newValue) {
      if (isNaN(newValue) || !isFinite(newValue)) return
      this.$refs.stepper.setValue(newValue)
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
