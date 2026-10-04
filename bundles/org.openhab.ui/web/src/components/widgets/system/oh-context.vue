<template>
  <generic-widget-component
    v-for="(slotComponent, idx) in defaultSlots"
    v-bind="$attrs"
    :key="'default-' + idx"
    :context="childrenContext(slotComponent)" />
</template>

<script>
import { f7 } from 'framework7-vue'

import { computed, nextTick, watch } from 'vue'
import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import { OhContextDefinition } from '@/assets/definitions/widgets/system'
import { isTrackableProp, useStatesStore } from '@/js/stores/useStatesStore'

export default {
  inheritAttrs: false,
  props: {
    context: Object
  },
  widget: OhContextDefinition,
  setup(props) {
    const { varScope, childContext, evaluateExpression, defaultSlots } = useWidgetContext(computed(() => props.context))
    varScope.value = (props.context.varScope || 'varScope') + '-' + f7.utils.id()
    const statesStore = useStatesStore()
    return { varScope, childContext, evaluateExpression, defaultSlots, statesStore }
  },
  data() {
    return {
      const: {},
      localCtxVars: {}
    }
  },
  computed: {
    fn() {
      if (!this.context?.component?.config) return {}
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
    childrenContext(childComp) {
      const ctx = this.childContext(childComp)
      const ctxFunctions = this.fn
      if (this.context.fn) {
        for (const funcKey in this.context.fn) {
          if (!ctxFunctions[funcKey]) ctxFunctions[funcKey] = this.context.fn[funcKey]
        }
      }
      ctx.fn = ctxFunctions

      ctx.const = {
        ...(this.context.const || {}),
        ...this.const
      }

      if (typeof ctx.ctxVars !== 'object') ctx.ctxVars = {}
      ctx.ctxVars[this.varScope] = this.localCtxVars

      return ctx
    },
    collectMissingItems(evaluateDefaults) {
      if (!this.context?.store) return []

      const accessedItems = new Set()
      const trackingStore = new Proxy(this.context.store, {
        get(target, prop) {
          if (isTrackableProp(prop)) accessedItems.add(prop)
          return target[prop]
        }
      })
      evaluateDefaults({ ...this.context, store: trackingStore })

      return Array.from(accessedItems).filter((itemName) => !this.statesStore.itemStates.has(itemName))
    }
  },
  beforeMount() {
    const config = this.context?.component?.config
    if (!config?.constants && !config?.variables) return

    const initialVars = {}
    const evaluateDefaults = (evaluationContext = this.context) => {
      const config = this.context?.component?.config

      const sourceConst = config.constants || {}
      if (sourceConst && typeof sourceConst === 'object') {
        for (const key in sourceConst) {
          this.const[key] = this.evaluateExpression(key, sourceConst[key], evaluationContext)
        }
      }

      const sourceCtxVars = config.variables
      if (sourceCtxVars && typeof sourceCtxVars === 'object') {
        for (const key in sourceCtxVars) {
          const evaluated = this.evaluateExpression(key, sourceCtxVars[key], evaluationContext)
          if (evaluationContext === this.context) {
            // On hydration re-evaluation, only update the variable if it has not been modified by a user/widget action
            if (this.localCtxVars[key] === initialVars[key]) {
              this.localCtxVars[key] = evaluated
            }
          } else {
            initialVars[key] = evaluated
            this.localCtxVars[key] = evaluated
          }
        }
      }
    }

    const missingItems = this.collectMissingItems(evaluateDefaults)
    if (missingItems.length === 0) return

    let stop = null
    stop = watch(
      () => missingItems.map((itemName) => this.statesStore.itemStates.has(itemName)).every(Boolean),
      (ready) => {
        if (!ready) return
        evaluateDefaults()
        void nextTick(() => {
          if (stop) stop()
        })
      },
      { immediate: true }
    )
  }
}
</script>
