<template>
  <div v-if="context.component.slots && context.component.slots.default">
    <generic-widget-component v-for="(slotComponent, idx) in context.component.slots.default"
                              :key="'default-' + idx"
                              :context="childrenContext(slotComponent)" />
  </div>
</template>

<script>
import { utils } from 'framework7'

import mixin from '../widget-mixin'
import { OhContextDefinition } from '@/assets/definitions/widgets/system'

export default {
  mixins: [mixin],
  widget: OhContextDefinition,
  data () {
    return {
      varScope: (this.context.varScope || 'varScope') + '-' + utils.id()
    }
  },
  computed: {
    fn () {
      if (!this.context || !this.context.component || !this.context.component.config) return {}
      let evalFunc = {}
      const sourceFunc = this.context.component.config.functions || {}
      console.debug('oh-context: sourceFunc =', sourceFunc)
      if (sourceFunc) {
        if (typeof sourceFunc !== 'object') return {}
        for (const key in sourceFunc) {
          evalFunc[key] = this.evaluateExpression(key, sourceFunc[key])
        }
      }
      console.debug('oh-context: evalFunc =', evalFunc)
      return evalFunc
    }
  },
  methods: {
    childrenContext (childComp) {
      const ctx = this.childContext(childComp)
      const ctxFunctions = this.fn
      if (this.context.fn) {
        for (const funcKey in this.context.fn) {
          if (!ctxFunctions[funcKey]) ctxFunctions[funcKey] = this.context.fn[funcKey]
        }
      }
      ctx.fn = ctxFunctions

      const ctxConstants = this.const
      if (this.context.const) {
        for (const constKey in this.context.const) {
          if (!ctxConstants[constKey]) ctxConstants[constKey] = this.context.const[constKey]
        }
      }
      ctx.const = ctxConstants

      if (typeof ctx.ctxVars !== 'object') ctx.ctxVars = {}
      ctx.ctxVars[this.varScope] = this.ctxVars

      return ctx
    }
  },
  beforeMount () {
    const evaluateDefaults = () => {
      if (!this.context || !this.context.component || !this.context.component.config) return

      this.const = {}
      const sourceConst = this.context.component.config.constants || {}
      if (sourceConst) {
        if (typeof sourceConst !== 'object') return
        for (const key in sourceConst) {
          this.const[key] = this.evaluateExpression(key, sourceConst[key])
        }
      }

      this.ctxVars = {}
      const sourceCtxVars = this.context.component.config.variables || {}
      if (sourceCtxVars) {
        if (typeof sourceCtxVars !== 'object') return
        for (const key in sourceCtxVars) {
          this.ctxVars[key] = this.evaluateExpression(key, sourceCtxVars[key])
        }
      }
    }
    evaluateDefaults()
  }
}
</script>
