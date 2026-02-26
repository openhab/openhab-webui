import { f7 } from 'framework7-vue'

import scope from 'scope-css'

import { useUserStore } from '@/js/stores/useUserStore'
import { useComponentsStore } from '@/js/stores/useComponentsStore'
import { useWidgetExpression } from '@/components/widgets/useWidgetExpression.ts'

import type { WidgetContext } from './types'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import * as api from '@/api'

/**
 * The useWidgetContext must be used as a composable in all widget components
 *
 * A few requirements have to be met by components importing this composable:
 * - Widget components have to add a `component` ref to their root.
 * - Page components have to add a `page` ref to their root.
 * - All components using this composable have to add the `scopedCssUid` as a class to their root element.
 */
export function useWidgetContext(context: WidgetContext) {
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-return */
  if (!context) return {} as any

  const _evaluateExpression = useWidgetExpression().evaluateExpression

  // state
  const vars = ref(context ? context.vars : {})
  const ctxVars = ref(context ? context.ctxVars : {})
  const widgetVars = ref<Record<string, unknown>>({})
  const varScope = ref(null)
  const scopedCssUid = ref<string | null>(null)
  const widgetExpression = useWidgetExpression()

  // computed
  const componentType = computed<string | null>(() => {
    if (!context.component?.component) return null
    return (evaluateExpression('type', context.component.component) as string) || null
  })

  const childWidgetComponentType = computed<string | null>(() => {
    if (!componentType.value) return null
    if (!componentType.value.startsWith('widget:')) return null
    const widget = useComponentsStore().widget(componentType.value.substring(7))
    if (!widget) {
      console.warn('widget not found, cannot render: ' + componentType.value)
      return null
    }
    return widget.component
  })

  const config = computed(() => {
    if (!context.component) return {}
    let evalConfig: Record<string, unknown> = {}
    // Fallback to modelConfig for oh- components to allow configuring them in modals
    const sourceConfig = context.component.config || (componentType.value?.startsWith('oh-') ? context.modalConfig : {})
    if (sourceConfig) {
      if (typeof sourceConfig !== 'object') return {}
      for (const [key, value] of Object.entries(sourceConfig)) {
        if (key === 'visible' || key === 'visibleTo' || key === 'stylesheet' || key === 'constants') continue
        evalConfig[key] = evaluateExpression(key, sourceConfig[key])
      }
    }
    return evalConfig
  })

  const props = computed((): Record<string, unknown> => {
    if (!context.component) return {}
    if ('props' in context.component && context.component.props.parameters) {
      let defaultValues: Record<string, unknown> = {}
      // Note api.ConfigDescriptionParameter uses 'defaultValue', but UI widgets just use 'default'
      context.component.props.parameters.forEach((p: { name: string; default?: unknown }) => {
        if (p.default !== undefined) {
          defaultValues[p.name] = p.default
        }
      })
      return Object.assign({}, defaultValues, context.props || {})
    } else {
      return context.props || {}
    }
  })

  const hasAction = computed(() => {
    return config.value && (config.value.action || config.value.actionPropsParameterGroup)
  })

  const visible = computed(() => {
    if (context.editmode || !context.component?.config) return true
    const visible = evaluateExpression('visible', context.component.config.visible)
    const visibleTo = context.component.config.visibleTo as string | undefined
    if (visible === undefined && visibleTo === undefined) return true
    if (visible === false || visible === 'false') return false
    if (visibleTo) {
      const user = useUserStore().user
      if (!user) return false
      if (user.roles && user.roles.some((r) => visibleTo.indexOf('role:' + r) >= 0)) return true
      return visibleTo.indexOf('user:' + user.name) >= 0
    }
    return true
  })

  const slots = computed(() => {
    if ('slots' in context.component) return context.component.slots
    return {}
  })

  const defaultSlots = computed(() => {
    if (context && 'slots' in context.component && context.component.slots.default) {
      return context.component.slots.default
    }
    return []
  })

  const childWidgetContext = computed((): WidgetContext | null => {
    if (!componentType.value?.startsWith('widget:')) return null
    let widget = useComponentsStore().widget(componentType.value.substring(7))
    if (!widget) {
      console.warn('widget not found, cannot render: ' + componentType.value)
      return null
    }
    if (context.vars) {
      for (const varKey in context.vars) {
        widgetVars.value[varKey] = context.vars[varKey]
      }
    }
    const extendedWidget =
      context.component && 'slots' in context.component ? { ...widget, slots: { ...widget.slots, ...context.component.slots } } : widget
    const widgetContext = {
      component: extendedWidget,
      props: config.value,
      fn: context.fn,
      const: context.const,
      vars: widgetVars.value,
      varScope: varScope.value || context.varScope,
      ctxVars: context.ctxVars,
      store: context.store,
      config: context.config,
      editmode: context.editmode,
      clipboardtype: context.clipboardtype,
      parent: context.parent
    } satisfies WidgetContext
    return widgetContext
  })

  // methods
  function evaluateExpression(key: string, value: any, _context?: WidgetContext, _props?: Record<string, unknown>): unknown {
    return _evaluateExpression(key, value, _context || context, _props || props.value)
  }

  function childContext(component: api.UiComponent): WidgetContext {
    return {
      component: component,
      props: props.value,
      fn: context.fn,
      const: context.const,
      vars: context.vars,
      varScope: varScope.value || context?.varScope,
      ctxVars: context.ctxVars,
      loop: context.loop,
      store: context.store,
      config: context.config,
      editmode: context.editmode,
      clipboardtype: context.clipboardtype,
      parent: context
    }
  }

  function cardChildContext(component: api.RootUiComponent): WidgetContext {
    // clone object to avoid mutating the original object
    const cmp = { ...component }
    if (cmp.config?.style) {
      cmp.config = { ...cmp.config }
      // remove style config as it should only apply to top-level element and not children
      delete cmp.config.style
    }
    return childContext(cmp)
  }

  // lifecycle
  onMounted(() => {
    const stylesheet = context.component?.config?.stylesheet as string | undefined
    if (stylesheet) {
      scopedCssUid.value = 'scoped-' + f7.utils.id()
      let style = document.createElement('style')
      style.id = scopedCssUid.value
      style.innerHTML = scope(stylesheet, '.' + scopedCssUid.value)
      document.head.appendChild(style)
    }
  })

  onBeforeUnmount(() => {
    if (scopedCssUid.value) {
      const scoped_stylesheet = document.getElementById(scopedCssUid.value)
      if (scoped_stylesheet) scoped_stylesheet.remove()
    }
  })

  return {
    // state
    vars,
    ctxVars,
    widgetVars,
    varScope,
    scopedCssUid,
    widgetExpression,

    // computed
    componentType,
    childWidgetComponentType,
    config,
    props,
    hasAction,
    visible,
    slots,
    defaultSlots,
    childWidgetContext,

    // methods
    evaluateExpression,
    childContext,
    cardChildContext
  }
}
