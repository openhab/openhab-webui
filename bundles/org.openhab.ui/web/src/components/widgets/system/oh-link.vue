<template>
  <f7-link v-bind="config" @click="clicked">
    <template v-if="defaultSlots.length > 0">
      <generic-widget-component
        v-for="(slotComponent, idx) in defaultSlots"
        :context="childContext(slotComponent)"
        :key="'default-' + idx" />
    </template>
  </f7-link>
</template>

<script>
import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import { OhLinkDefinition } from '@/assets/definitions/widgets/system'
import { actionsMixin } from '../widget-actions'

import { getVariableScope, setVariableKeyValues } from '@/components/widgets/variable'

export default {
  mixins: [actionsMixin],
  props: {
    context: Object
  },
  widget: OhLinkDefinition,
  setup (props) {
    const { config, childContext, evaluateExpression, hasAction, defaultSlots } = useWidgetContext(props.context)
    return { config, childContext, evaluateExpression, hasAction, defaultSlots }
  },
  methods: {
    clicked () {
      if (this.hasAction) {
        this.performAction()
      }
      if (this.config.clearVariable && !this.config.clearVariableKey) {
        if (Array.isArray(this.config.clearVariable)) {
          this.config.clearVariable.forEach((v) => {
            const clearVariableScope = getVariableScope(this.context.ctxVars, this.context.varScope, v)
            const clearVariableLocation = (clearVariableScope) ? this.context.ctxVars[clearVariableScope] : this.context.vars
            clearVariableLocation[v] = undefined
          })
        } else if (typeof this.config.clearVariable === 'string') {
          const clearVariableScope = getVariableScope(this.context.ctxVars, this.context.varScope, this.config.clearVariable)
          const clearVariableLocation = (clearVariableScope) ? this.context.ctxVars[clearVariableScope] : this.context.vars
          clearVariableLocation[this.config.clearVariable] = undefined
        }
      }
      if (this.config.clearVariable && this.config.clearVariableKey) {
        let value = this.context.vars[this.config.clearVariable]
        if (Array.isArray(this.config.clearVariableKey)) {
          this.config.clearVariableKey.forEach((key) => {
            const clearVariableScope = getVariableScope(this.context.ctxVars, this.context.varScope, this.config.clearVariable)
            const clearVariableLocation = (clearVariableScope) ? this.context.ctxVars[clearVariableScope] : this.context.vars
            value = setVariableKeyValues(clearVariableLocation, key, undefined)
          })
        } else if (typeof this.config.clearVariableKey === 'string') {
          const clearVariableScope = getVariableScope(this.context.ctxVars, this.context.varScope, this.config.clearVariable)
          const clearVariableLocation = (clearVariableScope) ? this.context.ctxVars[clearVariableScope] : this.context.vars
          value = setVariableKeyValues(clearVariableLocation, this.config.clearVariableKey, undefined)
        }
        this.context.vars[this.config.clearVariable] = value
      }
    }
  }
}
</script>
