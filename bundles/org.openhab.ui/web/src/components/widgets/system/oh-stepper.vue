<template>
  <f7-stepper ref="stepper"
              v-bind="config"
              @stepper:plusclick="onPlusMinusClick"
              @stepper:minusclick="onPlusMinusClick"
              @input="onInput"
              :input="config.enableInput === true"
              :manual-input-mode="true"
              :format-value="formatValue" />
</template>

<style lang="stylus">
.stepper-value
  margin-top: 0px
</style>

<script>
import mixin from '../widget-mixin'
import variableMixin from '../variable-mixin'
import { OhStepperDefinition } from '@/assets/definitions/widgets/system'

import { useStatesStore } from '@/js/stores/useStatesStore'

export default {
  mixins: [mixin, variableMixin],
  widget: OhStepperDefinition,
  mounted () {
    delete this.config.value
    this.$refs.stepper.setValue(this.value)
  },
  computed: {
    value () {
      const applyOffset = (num) => (!isNaN(this.config.offset)) ? Number(this.toStepFixed(num + Number(this.config.offset))) : num
      if (this.config.variable) {
        const variableScope = this.getVariableScope(this.context.ctxVars, this.context.varScope, this.config.variable)
        const variableLocation = (variableScope) ? this.context.ctxVars[variableScope] : this.context.vars
        if (this.config.variableKey) {
          return applyOffset(this.getLastVariableKeyValue(variableLocation[this.config.variable], this.config.variableKey))
        }
        return applyOffset(variableLocation[this.config.variable])
      }
      let value = applyOffset(parseFloat(this.context.store[this.config.item].state))
      if (this.config.min !== undefined) value = Math.max(value, this.config.min)
      if (this.config.max !== undefined) value = Math.min(value, this.config.max)
      return value
    }
  },
  watch: {
    value (newValue) {
      if (isNaN(newValue) || !isFinite(newValue)) return
      this.$refs.stepper.setValue(Number(this.toStepFixed(newValue)))
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
      // do NOT convert to number, instead return string, otherwise formatting wouldn't work
      return parseFloat(value).toFixed(nbDecimals ? nbDecimals.length : 0)
    },
    onPlusMinusClick () {
      setTimeout(() => {
        this.sendCommand(this.$refs.stepper.getValue())
      }, 10)
    },
    onInput () {
      if (!this.config.enableInput) return
      setTimeout(() => {
        const newValue = this.$refs.stepper.getValue()
        if (Math.abs(newValue - this.value) < (this.config.step || 1)) return
        this.sendCommand(newValue)
      }, 1500)
    },
    sendCommand (value) {
      const applyOffset = (num) => (!isNaN(this.config.offset)) ? Number(this.toStepFixed(num - Number(this.config.offset))) : num
      let newValue = applyOffset(Number(this.toStepFixed(value)))
      if (isNaN(newValue)) newValue = this.config.min || this.config.max || 0
      if (newValue === this.value) return
      if (this.config.variable) {
        const variableScope = this.getVariableScope(this.context.ctxVars, this.context.varScope, this.config.variable)
        const variableLocation = (variableScope) ? this.context.ctxVars[variableScope] : this.context.vars
        if (this.config.variableKey) {
          newValue = applyOffset(this.setVariableKeyValues(variableLocation[this.config.variable], this.config.variableKey, value))
        }
        variableLocation[this.config.variable] = newValue
      } else if (this.config.item) {
        useStatesStore().sendCommand(this.config.item, newValue.toString())
      }
    }
  }
}
</script>
