<template>
  <f7-stepper ref="stepper" v-bind="config" :value="value" @stepper:change="onChange" @click.native.stop
              :manual-input-mode="false" :format-value="formatValue" />
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
      const value = this.toStepFixed(parseFloat(this.context.store[this.config.item].state))
      return value
    }
  },
  watch: {
    value (newValue) {
      if (isNaN(newValue) || !isFinite(newValue)) return
      this.$refs.stepper.setValue(this.toStepFixed(newValue).toString())
    }
  },
  methods: {
    formatValue (value) {
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
        this.$set(this.context.vars, this.config.variable, newValue)
      } else if (this.config.item) {
        this.$store.dispatch('sendCommand', { itemName: this.config.item, cmd: newValue.toString() })
      }
    }
  }
}
</script>
