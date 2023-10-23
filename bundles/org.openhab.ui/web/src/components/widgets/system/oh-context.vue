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
    const evaluateConstants = () => {
      if (!this.context || !this.context.component || !this.context.component.config || !this.context.component.config.constants) return {}
      let evalConst = {}
      const sourceConst = this.context.component.config.constants || {}
      if (sourceConst) {
        if (typeof sourceConst !== 'object') return {}
        for (const key in sourceConst) {
          this.$set(evalConst, key, this.evaluateExpression(key, sourceConst[key]))
        }
      }
      return evalConst
    }

    this.const = evaluateConstants()
  },
  widget: OhContextDefinition,
  computed: {
    func () {
      if (!this.context || !this.context.component || !this.context.component.config || !this.context.component.config.functions) return {}
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
      const ctxFunctions = this.func
      if (ctx.func) {
        for (const funcKey in this.context.func) {
          if (!ctxFunctions[funcKey]) this.$set(ctxFunctions, funcKey, this.context.func[funcKey])
        }
      }
      this.$set(ctx, 'func', ctxFunctions)

      //const ctxConstants = (this.context.component.config && this.context.component.config.constants) || {}
      const ctxConstants = this.const
      if (ctx.const) {
        for (const constKey in this.context.const) {
          if (!ctxConstants[constKey]) this.$set(ctxConstants, constKey, this.context.const[constKey])
        }
      }
      this.$set(ctx, 'const', ctxConstants)

      return ctx
    }
  }
}
</script>
