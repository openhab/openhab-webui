import { computed, getCurrentInstance, inject, type Ref } from 'vue'
import { theme } from 'framework7-vue'

import expr, { addUnaryOp, evaluate, parse } from 'jse-eval'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import calendar from 'dayjs/plugin/calendar'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import isoWeek from 'dayjs/plugin/isoWeek'
import isToday from 'dayjs/plugin/isToday'
import isYesterday from 'dayjs/plugin/isYesterday'
import isTomorrow from 'dayjs/plugin/isTomorrow'

import jsepRegex from '@jsep-plugin/regex'
import jsepArrow from '@jsep-plugin/arrow'
import jsepObject from '@jsep-plugin/object'
import jsepTemplate from '@jsep-plugin/template'

import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'
import { useStatesStore } from '@/js/stores/useStatesStore'
import { useUserStore } from '@/js/stores/useUserStore'
import { i18n } from '@/js/i18n.ts'

import type { WidgetContext, WidgetProps } from './types'

expr.jsep.plugins.register(jsepRegex, jsepArrow, jsepObject, jsepTemplate)

addUnaryOp('@', (itemName: string | undefined): string => {
  if (itemName === undefined) return '-'
  const item = useStatesStore().trackedItems[itemName]
  return (item.displayState !== undefined ? item.displayState : item.state) ?? '-'
})
addUnaryOp('@@', (itemName: string | undefined): string => {
  if (itemName === undefined) return '-'
  return useStatesStore().trackedItems[itemName]?.state ?? '-'
})
addUnaryOp('#', (itemName: string | undefined): number | undefined => {
  if (itemName === undefined) return undefined
  return useStatesStore().trackedItems[itemName]?.numericState
})

dayjs.extend(relativeTime)
dayjs.extend(calendar)
dayjs.extend(localizedFormat)
dayjs.extend(isoWeek)
dayjs.extend(isToday)
dayjs.extend(isYesterday)
dayjs.extend(isTomorrow)

interface ExpressionAstCache {
  [key: string]: any
}

interface ScreenInfo {
  width: number
  height: number
  availWidth: number
  availHeight: number
  colorDepth: number
  pixelDepth: number
  viewAreaWidth: number | null
  viewAreaHeight: number | null
  appWidth: number
  appHeight: number
}

/**
 * Composable providing the functionality to evaluate widget expressions.
 *
 * The `screen.viewAreaWidth` and `screen.viewAreaHeight` properties are only available to expressions
 * if `viewAreaWidth` and `viewAreaHeight` refs are provided via Vue's dependency injection mechanism.
 *
 * Widget expression evaluations need access to the current widget context and props.
 * If they are available at composable instantiation, they can be passed as properties to the composable.
 * If they, however, aren't available at instantiation (e.g. because they are computed), they can be passed as function parameters later.
 *
 * @param properties
 */
export function useWidgetExpression (properties: { context?: WidgetContext, props?: WidgetProps } = {}) {
  // imports
  const userStore = useUserStore()
  const uiOptionsStore = useUIOptionsStore()

  const instance = getCurrentInstance()
  const global = instance?.appContext.config.globalProperties

  // data
  const exprAst: ExpressionAstCache = {}
  const viewAreaWidth = inject('viewAreaWidth', null) as Ref<number> | null
  const viewAreaHeight = inject('viewAreaHeight', null) as Ref<number> | null

  // computed
  const appWidth = computed(() => global?.$f7dim.width ?? 0)
  const appHeight = computed(() => global?.$f7dim.height ?? 0)

  const screenInfo = computed<ScreenInfo>(() => {
    return {
      width: window.screen.width,
      height: window.screen.height,
      availWidth: window.screen.availWidth,
      availHeight: window.screen.availHeight,
      colorDepth: window.screen.colorDepth,
      pixelDepth: window.screen.pixelDepth,
      viewAreaWidth: viewAreaWidth != null ? viewAreaWidth.value : null,
      viewAreaHeight: viewAreaHeight != null ? viewAreaHeight.value : null,
      appWidth: appWidth.value,
      appHeight: appHeight.value
    }
  })

  // methods
  function getAllVars (context: WidgetContext): Record<string, any> {
    const vars: Record<string, any> = {}
    if (context.vars) {
      for (const varKey in context.vars) {
        vars[varKey] = context.vars[varKey]
      }
    }
    if (context.varScope) {
      const scopeIDs = context.varScope.split('-')
      for (let scope_idx = 1; scope_idx < scopeIDs.length; scope_idx++) {
        const scopeKey = scopeIDs.slice(0, scope_idx + 1).join('-')
        if (context.ctxVars?.[scopeKey]) {
          for (const varKey in context.ctxVars[scopeKey]) {
            vars[varKey] = context.ctxVars[scopeKey][varKey]
          }
        }
      }
    }
    return vars
  }

  /**
   * Evaluates a widget expression.
   * If widget context and props were not passed to the composable at instantiation, they have to be passed to the function.
   *
   * @param key the key of the expression (used for abstract syntax tree caching)
   * @param value the expression to evaluate
   * @param context the context to evaluate the expression in (not required if already provided as composable property)
   * @param props the props to make available to the expression (not required if already provided as composable property)
   * @returns the result of the expression evaluation
   */
  function evaluateExpression (key: string, value: any, context?: WidgetContext, props?: WidgetProps): any {
    if (value === null) return null
    const ctx = context || properties.context
    if (!ctx) return null
    if (typeof value === 'string' && value.startsWith('=')) {
      try {
        // we cache the parsed abstract tree to prevent it from being parsed again at runtime
        // if we are in edit-mode according to the context, do not cache because the expression is subject to change
        if (!exprAst[key] || ctx.editmode) {
          exprAst[key] = parse(value.substring(1))
        }
        return evaluate(exprAst[key], {
          items: ctx.store,
          props: props || properties?.props,
          config: ctx.component?.config,
          fn: ctx.fn,
          const: ctx.const,
          vars: getAllVars(ctx),
          loop: ctx.loop,
          Math,
          Number,
          theme,
          themeOptions: uiOptionsStore.themeOptions(),
          device: global?.$device,
          screen: screenInfo.value,
          JSON,
          dayjs,
          user: userStore.user,
          translation: i18n.global.t,
          t: i18n.global.t
        })
      } catch (e) {
        return e
      }
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      const evalObj: Record<string, any> = {}
      for (const objKey in value) {
        evalObj[objKey] = evaluateExpression(key + '.' + objKey, value[objKey], ctx, props || properties?.props)
      }
      return evalObj
    } else if (typeof value === 'object' && Array.isArray(value)) {
      const evalArr: any[] = []
      for (let i = 0; i < value.length; i++) {
        evalArr[i] = evaluateExpression(key + '.' + i, value[i], ctx, props || properties?.props)
      }
      return evalArr
    } else {
      return value
    }
  }

  return {
    evaluateExpression
  }
}
