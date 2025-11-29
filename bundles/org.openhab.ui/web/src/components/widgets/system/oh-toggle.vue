<template>
  <f7-toggle v-bind="config"
             :checked="value ? true : null"
             :class="['oh-toggle', (value === null ? 'unknown-state' : '')]"
             @toggle:change="onChange"
             @click.stop />
</template>

<style lang="stylus">
.large-vertical-toggle.oh-toggle.unknown-state
  .toggle-icon::after
     transform rotate(90deg)

.oh-toggle.unknown-state
  .toggle-icon::after
    content '?'
    font-weight bold
    color var(--f7-toggle-inactive-color)
    display flex
    justify-content center
    align-items center
</style>

<script>
import mixin from '../widget-mixin'
import { OhToggleDefinition } from '@/assets/definitions/widgets/system'

import { getVariableScope, getLastVariableKeyValue, setVariableKeyValues } from '@/components/widgets/variable'

import { useStatesStore } from '@/js/stores/useStatesStore'

export default {
  mixins: [mixin],
  widget: OhToggleDefinition,
  mounted () {
    delete this.config.value
  },
  computed: {
    value () {
      if (this.config.variable) {
        const variableScope = getVariableScope(this.context.ctxVars, this.context.varScope, this.config.variable)
        const variableLocation = (variableScope) ? this.context.ctxVars[variableScope] : this.context.vars
        if (this.config.variableKey) {
          return getLastVariableKeyValue(variableLocation[this.config.variable], this.config.variableKey)
        }
        return variableLocation[this.config.variable]
      }
      if (!this.context.store[this.config.item]) return
      const value = this.context.store[this.config.item].state
      if (value === 'ON') return true
      if (value === 'OFF') return false
      if (value.split(',').length === 3) return (value.split(',')[2] !== '0')
      if (value === 'UNDEF' || value === 'NULL' || value === '-') return null
      return false
    }
  },
  methods: {
    onChange (value) {
      if (value === this.value) return
      if (this.config.variable) {
        const variableScope = getVariableScope(this.context.ctxVars, this.context.varScope, this.config.variable)
        const variableLocation = (variableScope) ? this.context.ctxVars[variableScope] : this.context.vars
        if (this.config.variableKey) {
          value = setVariableKeyValues(variableLocation[this.config.variable], this.config.variableKey, value)
        }
        variableLocation[this.config.variable] = value
      } else if (this.config.item) {
        useStatesStore().sendCommand(this.config.item, (value) ? 'ON' : 'OFF')
      }
    }
  }
}
</script>
