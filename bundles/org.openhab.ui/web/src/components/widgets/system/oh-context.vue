<template>
  <fragment v-if="context.component.slots && context.component.slots.default">
    <generic-widget-component v-for="(slotComponent, idx) in context.component.slots.default"
                              :key="'default-' + idx"
                              :context="childrenContext(slotComponent)" />
  </fragment>
</template>

<script>
import mixin from '../widget-mixin'
import { OhContextDefinition } from '@/assets/definitions/widgets/system'

import { Fragment } from 'vue-fragment'

export default {
  mixins: [mixin],
  components: {
    Fragment
  },
  widget: OhContextDefinition,
  data () {
    return {
      varScope: (this.context.varScope || 'varScope') + '-' + this.$f7.utils.id()
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
          if (!ctxFunctions[funcKey]) this.$set(ctxFunctions, funcKey, this.context.fn[funcKey])
        }
      }
      this.$set(ctx, 'fn', ctxFunctions)

      const ctxConstants = this.const
      if (this.context.const) {
        for (const constKey in this.context.const) {
          if (!ctxConstants[constKey]) this.$set(ctxConstants, constKey, this.context.const[constKey])
        }
      }
      this.$set(ctx, 'const', ctxConstants)

      if (typeof ctx.ctxVars !== 'object') this.$set(ctx, 'ctxVars', {})
      this.$set(ctx.ctxVars, this.varScope, this.ctxVars)

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
          this.$set(this.const, key, this.evaluateExpression(key, sourceConst[key]))
        }
      }

      this.ctxVars = {}
      const sourceCtxVars = this.context.component.config.variables || {}
      if (sourceCtxVars) {
        if (typeof sourceCtxVars !== 'object') return
        for (const key in sourceCtxVars) {
          this.$set(this.ctxVars, key, this.evaluateExpression(key, sourceCtxVars[key]))
        }
      }
    }
    evaluateDefaults()
  }
}
</script>
