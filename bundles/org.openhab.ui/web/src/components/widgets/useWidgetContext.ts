import { f7 } from 'framework7-vue'

import scope from 'scope-css'

import { useUserStore } from '@/js/stores/useUserStore'
import { useComponentsStore } from '@/js/stores/useComponentsStore'
import { useWidgetExpression } from '@/components/widgets/useWidgetExpression.ts'

import type { ContextVarObj, VariableObject, VariableScopeName, VariableValue, WidgetContext } from './types'
import { type EvaluateExpressionFn } from '@/components/widgets/useWidgetExpression.ts'
import { computed, onBeforeUnmount, onMounted, type Ref, ref } from 'vue'
import * as api from '@/api'
import { applyParameterDefaults } from '@/components/widgets/helpers.ts'
import { type ConfigGuardFn } from '@/types/widget-ts-template'

/**
 * useWidgetContext must be used as a composable in all widget components.
 *
 * A few requirements have to be met by components importing this composable:
 * - All components using this composable have to add the `scopedCssUid` as a class to their root element.
 *
 * @param context the reactive widget context (use `computed(() => props.context)` to convert the component prop to a reactive ref)
 */
export function useWidgetContext<T = Record<string, unknown>>(context: Ref<WidgetContext>, isConfig?: ConfigGuardFn<T>) {
  if (!context || !context.value) {
    throw new Error('useWidgetContext must be called with a reactive ref to the widget context')
  }

  const widgetExpression = useWidgetExpression()
  const _evaluateExpression = widgetExpression.evaluateExpression
  const componentsStore = useComponentsStore()
  const userStore = useUserStore()

  // state
  const vars = ref<VariableObject>(context.value.vars ?? {})
  const ctxVars = ref<ContextVarObj>(context.value.ctxVars ?? {})
  const widgetVars = ref<VariableObject>({})
  const varScope = ref<VariableScopeName | null>(null)
  const scopedCssUid = ref<string | null>(null)

  // computed
  const componentType = computed<string | null>(() => {
    const component = context.value.component.component
    if (!component) return null
    return (evaluateExpression('type', component) as string) || null
  })

  const childWidgetComponentType = computed<string | null>(() => {
    if (!componentType.value) return null
    if (!componentType.value.startsWith('widget:')) return null
    const widget = componentsStore.widget(componentType.value.substring(7))
    if (!widget) {
      console.warn('widget not found, cannot render: ' + componentType.value)
      return null
    }
    return widget.component
  })

  const config = computed<T>(() => {
    if (!context.value.component) return {} as T
    let evalConfig: Record<string, unknown> = {}
    // Fallback to modelConfig for oh- components to allow configuring them in modals
    const sourceConfig: Record<string, unknown> =
      context.value.component.config || (componentType.value?.startsWith('oh-') ? context.value.modalConfig : {})
    if (sourceConfig) {
      if (typeof sourceConfig !== 'object') return {} as T
      for (const [key, value] of Object.entries(sourceConfig)) {
        if (key === 'visible' || key === 'visibleTo' || key === 'stylesheet' || key === 'constants') continue
        evalConfig[key] = evaluateExpression(key, value)
      }
    }
    if (!isConfig || isConfig(evalConfig)) {
      return evalConfig as T
    }
    throw new Error('useWidgetContext: config does not match expected type')
  })

  const props = computed<Record<string, unknown>>(() => {
    if (!context.value.component) return {}
    if ('props' in context.value.component && context.value.component.props.parameters) {
      let defaultValues: Record<string, unknown> = {}
      applyParameterDefaults(context.value.component.props.parameters, defaultValues)
      return Object.assign({}, defaultValues, context.value.props || {})
    } else {
      return context.value.props || {}
    }
  })

  const hasAction = computed<boolean>(() => {
    const cfg = config.value as Record<string, unknown>
    return !!(cfg && (cfg.action || cfg.actionPropsParameterGroup))
  })

  const visible = computed<boolean>(() => {
    if (context.value.editmode || !context.value.component?.config) return true
    const visible = evaluateExpression('visible', context.value.component.config.visible)
    const visibleTo = context.value.component.config.visibleTo as string | undefined
    if (visible === undefined && visibleTo === undefined) return true
    if (visible === false || visible === 'false') return false
    if (visibleTo) {
      const user = userStore.user
      if (!user) return false
      if (user.roles && user.roles.some((r) => visibleTo.indexOf('role:' + r) >= 0)) return true
      return visibleTo.indexOf('user:' + user.name) >= 0
    }
    return true
  })

  const slots = computed<Record<string, api.UiComponent[]>>(() =>
    'slots' in context.value.component && context.value.component.slots ? context.value.component.slots : {}
  )

  const defaultSlots = computed<api.UiComponent[]>(() =>
    'slots' in context.value.component && context.value.component.slots?.default ? context.value.component.slots.default : []
  )

  const childWidgetContext = computed((): WidgetContext | null => {
    if (!componentType.value?.startsWith('widget:')) return null
    let widget = componentsStore.widget(componentType.value.substring(7))
    if (!widget) {
      console.warn('widget not found, cannot render: ' + componentType.value)
      return null
    }
    if (vars.value) {
      for (const varKey in vars.value) {
        widgetVars.value[varKey] = vars.value[varKey]
      }
    }
    const extendedWidget =
      context.value.component && 'slots' in context.value.component
        ? { ...widget, slots: { ...widget.slots, ...context.value.component.slots } }
        : widget
    return {
      component: extendedWidget as api.RootUiComponent | api.UiComponent,
      props: config.value as Record<string, unknown>,
      fn: context.value.fn,
      const: context.value.const,
      vars: widgetVars.value,
      varScope: varScope.value || context.value.varScope,
      ctxVars: ctxVars.value,
      store: context.value.store,
      config: context.value.config,
      editmode: context.value.editmode,
      clipboardtype: context.value.clipboardtype,
      noExpressionCache: context.value.noExpressionCache,
      parent: context.value.parent
    } satisfies WidgetContext
  })

  // methods
  const evaluateExpression: EvaluateExpressionFn = <T = unknown>(
    key: string,
    value: T,
    _context?: WidgetContext,
    _props?: Record<string, unknown>
  ): T | Error => {
    return _evaluateExpression(key, value, _context ?? context.value, _props ?? props.value)
  }

  function childContext(component: api.UiComponent): WidgetContext {
    return {
      component: component,
      props: props.value,
      fn: context.value.fn,
      const: context.value.const,
      vars: vars.value,
      varScope: varScope.value || context.value.varScope,
      ctxVars: ctxVars.value,
      loop: context.value.loop,
      store: context.value.store,
      config: context.value.config,
      editmode: context.value.editmode,
      clipboardtype: context.value.clipboardtype,
      noExpressionCache: context.value.noExpressionCache,
      parent: context.value
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
    const stylesheet = context.value.component.config?.stylesheet as string | undefined
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
