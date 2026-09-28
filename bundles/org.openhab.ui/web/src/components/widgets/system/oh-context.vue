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
import { useStatesStore } from '@/js/stores/useStatesStore'

const INVALID_ITEM_STORE_PROPS = new Set(['_keys', '__ob__', 'toString', 'undefined', 'constructor', 'getters', 'effect', '_vm', 'toJSON'])

function isTrackableItemStoreProp(prop) {
  return typeof prop === 'string' && !INVALID_ITEM_STORE_PROPS.has(prop) && !prop.startsWith('__v_')
}

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
      const accessedItems = new Set()
      const trackingStore = new Proxy(this.context.store, {
        get(target, prop) {
          if (isTrackableItemStoreProp(prop)) accessedItems.add(prop)
          return target[prop]
        }
      })
      evaluateDefaults({ ...this.context, store: trackingStore })

      return Array.from(accessedItems).filter((itemName) => !this.statesStore.itemStates.has(itemName))
    }
  },
  beforeMount() {
    const evaluateDefaults = (evaluationContext = this.context) => {
      if (!this.context?.component?.config) return

      this.const = {}
      const sourceConst = this.context.component.config.constants || {}
      if (sourceConst) {
        if (typeof sourceConst !== 'object') return
        for (const key in sourceConst) {
          this.const[key] = this.evaluateExpression(key, sourceConst[key], evaluationContext)
        }
      }

      this.localCtxVars = {}
      const sourceCtxVars = this.context.component.config.variables || {}
      if (sourceCtxVars) {
        if (typeof sourceCtxVars !== 'object') return
        for (const key in sourceCtxVars) {
          this.localCtxVars[key] = this.evaluateExpression(key, sourceCtxVars[key], evaluationContext)
        }
      }
    }

    const missingItems = this.collectMissingItems(evaluateDefaults)
    if (missingItems.length === 0) return

    let stop = null
    stop = watch(
      () => missingItems.every((itemName) => this.statesStore.itemStates.has(itemName)),
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
