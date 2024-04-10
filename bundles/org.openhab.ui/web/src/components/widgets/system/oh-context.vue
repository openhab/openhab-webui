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
  data () {
    return {
      varScope: (this.context.varScope || 'varScope') + '-' + this.$f7.utils.id()
    }
  },
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

      this.ctxVars = {}
      const sourceCtxVars = this.context.component.config.variables || {}
      if (sourceCtxVars) {
        if (typeof sourceCtxVars !== 'object') return {}
        for (const key in sourceCtxVars) {
          this.$set(this.ctxVars, key, this.evaluateExpression(key, sourceCtxVars[key]))
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

      this.$set(ctx.ctxVars, this.varScope, this.ctxVars)

      return ctx
    }
  }
}
</script>
