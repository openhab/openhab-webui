<template>
  <fragment v-if="(context.component.slots && context.component.slots.default)">
    <generic-widget-component :context="childrenContexts(slotComponent)" v-for="(slotComponent, idx) in context.component.slots.default" :key="'default-' + idx" />
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
  beforeMount () {
    const evaluateDefaults = () => {
      if (!this.context || !this.context.component || !this.context.component.config) return {}

      this.const = {}
      const sourceConst = this.context.component.config.constants || {}
      if (sourceConst) {
        if (typeof sourceConst !== 'object') return {}
        for (const key in sourceConst) {
          this.$set(this.const, key, this.evaluateExpression(key, sourceConst[key]))
        }
      }

      this.context.localVars = {}
      const sourceLVars = this.context.component.config.localVars || {}
      if (sourceLVars) {
        if (typeof sourceLVars !== 'object') return {}
        for (const key in sourceLVars) {
          this.$set(this.context.localVars, key, this.evaluateExpression(key, sourceLVars[key]))
        }
      }
    }
    evaluateDefaults()
  },
  widget: OhContextDefinition,
  computed: {
    fn () {
      if (!this.context || !this.context.component || !this.context.component.config) return {}
      let evalFunc = {}
      const sourceFunc = this.context.component.config.functions || {}
      if (sourceFunc) {
        if (typeof sourceFunc !== 'object') return {}
        for (const key in sourceFunc) {
          this.$set(evalFunc, key, this.evaluateExpression(key, sourceFunc[key]))
        }
      }
      return evalFunc
    },
    gVars () {
      if (!this.context || !this.context.component || !this.context.component.config) return {}
      let evalVars = {}
      const sourceVars = this.context.component.config.globalVars || {}
      if (sourceVars) {
        if (typeof sourceVars !== 'object') return {}
        for (const key in sourceVars) {
          this.$set(evalVars, key, this.evaluateExpression(key, sourceVars[key]))
        }
      }
      return evalVars
    }
  },
  methods: {
    childrenContexts (childComp) {
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

      if (this.context.localVars) {
        for (const lVarKey in this.context.localVars) {
          this.$set(ctx.vars, lVarKey, this.context.localVars[lVarKey])
        }
      }

      return ctx
    }
  }
}
</script>
