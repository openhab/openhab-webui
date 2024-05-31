<template>
  <f7-toggle v-bind="config" :checked="value" @toggle:change="onChange" @click.native.stop />
</template>

<script>
import mixin from '../widget-mixin'
import variableMixin from '../variable-mixin'
import { OhToggleDefinition } from '@/assets/definitions/widgets/system'

export default {
  mixins: [mixin, variableMixin],
  widget: OhToggleDefinition,
  mounted () {
    delete this.config.value
  },
  computed: {
    value () {
      if (this.config.variable) {
        const variableScope = this.getVariableScope(this.context.ctxVars, this.context.varScope, this.config.variable)
        const variableLocation = (variableScope) ? this.context.ctxVars[variableScope] : this.context.vars
        if (this.config.variableKey) {
          return this.getLastVariableKeyValue(variableLocation[this.config.variable], this.config.variableKey)
        }
        return variableLocation[this.config.variable]
      }
      if (!this.context.store[this.config.item]) return
      const value = this.context.store[this.config.item].state
      if (value === 'ON') return true
      if (value === 'OFF') return false
      if (value.split(',').length === 3) return (value.split(',')[2] !== '0')
      return (['0', 'UNDEF', 'NULL', '-'].indexOf(value.toString()) < 0)
    }
  },
  methods: {
    onChange (value) {
      if (value === this.value) return
      if (this.config.variable) {
        const variableScope = this.getVariableScope(this.context.ctxVars, this.context.varScope, this.config.variable)
        const variableLocation = (variableScope) ? this.context.ctxVars[variableScope] : this.context.vars
        if (this.config.variableKey) {
          value = this.setVariableKeyValues(variableLocation[this.config.variable], this.config.variableKey, value)
        }
        this.$set(variableLocation, this.config.variable, value)
      } else if (this.config.item) {
        this.$store.dispatch('sendCommand', { itemName: this.config.item, cmd: (value) ? 'ON' : 'OFF' })
      }
    }
  }
}
</script>
