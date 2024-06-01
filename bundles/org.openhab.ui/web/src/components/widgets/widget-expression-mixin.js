import expr from 'jse-eval'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import calendar from 'dayjs/plugin/calendar'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import isoWeek from 'dayjs/plugin/isoWeek'
import isToday from 'dayjs/plugin/isToday'
import isYesterday from 'dayjs/plugin/isYesterday'
import isTomorrow from 'dayjs/plugin/isTomorrow'
import store from '@/js/store'

import jsepRegex from '@jsep-plugin/regex'
import jsepArrow from '@jsep-plugin/arrow'
import jsepObject from '@jsep-plugin/object'
import jsepTemplate from '@jsep-plugin/template'
expr.jsep.plugins.register(jsepRegex, jsepArrow, jsepObject, jsepTemplate)

expr.addUnaryOp('@', (itemName) => {
  if (itemName === undefined) return undefined
  const item = store.getters.trackedItems[itemName]
  return (item.displayState !== undefined) ? item.displayState : item.state
})
expr.addUnaryOp('@@', (itemName) => {
  if (itemName === undefined) return undefined
  return store.getters.trackedItems[itemName].state
})
expr.addUnaryOp('#', (itemName) => {
  if (itemName === undefined) return undefined
  return store.getters.trackedItems[itemName].numericState
})

dayjs.extend(relativeTime)
dayjs.extend(calendar)
dayjs.extend(localizedFormat)
dayjs.extend(isoWeek)
dayjs.extend(isToday)
dayjs.extend(isYesterday)
dayjs.extend(isTomorrow)

export default {
  data () {
    return {
      exprAst: {}
    }
  },
  methods: {
    /**
     * Evaluates a widget expression.
     * May read <code>this.context</code> and <code>this.props</code> (see below).
     *
     * @param {string} key the key of the expression (used for abstract syntax tree caching)
     * @param {string} value the expression to evaluate
     * @param {object} [context] the context to evaluate the expression in (defaults to <code>this.context</code>)
     * @param {object} [props] the props to make available to the expression (defaults to <code>this.props</code>)
     * @returns {*} the result of the expression evaluation
     */
    evaluateExpression (key, value, context, props) {
      if (value === null) return null
      const ctx = context || this.context
      if (typeof value === 'string' && value.startsWith('=')) {
        try {
          // we cache the parsed abstract tree to prevent it from being parsed again at runtime
          // in we're edit mode according to the context do not cache because the expression is subject to change
          if (!this.exprAst[key] || ctx.editmode) {
            this.exprAst[key] = expr.parse(value.substring(1))
          }
          return expr.evaluate(this.exprAst[key], {
            items: ctx.store,
            props: props || this.props,
            config: ctx.component.config,
            fn: ctx.fn,
            const: ctx.const,
            vars: this.getAllVars(ctx),
            loop: ctx.loop,
            Math: Math,
            Number: Number,
            theme: this.$theme,
            themeOptions: this.$f7.data.themeOptions,
            device: this.$device,
            screen: this.getScreenInfo(),
            JSON: JSON,
            dayjs: dayjs,
            user: this.$store.getters.user
          })
        } catch (e) {
          return e
        }
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        const evalObj = {}
        for (const objKey in value) {
          this.$set(evalObj, objKey, this.evaluateExpression(key + '.' + objKey, value[objKey]))
        }
        return evalObj
      } else if (typeof value === 'object' && Array.isArray(value)) {
        const evalArr = []
        for (let i = 0; i < value.length; i++) {
          this.$set(evalArr, i, this.evaluateExpression(key + '.' + i, value[i]))
        }
        return evalArr
      } else {
        return value
      }
    },
    getScreenInfo () {
      const pageCurrent = document.getElementsByClassName('page-current').item(0)
      const pageContent = pageCurrent.getElementsByClassName('page-content').item(0)
      const pageContentStyle = window.getComputedStyle(pageContent)

      return {
        width: window.screen.width,
        height: window.screen.height,
        availWidth: window.screen.availWidth,
        availHeight: window.screen.availHeight,
        colorDepth: window.screen.colorDepth,
        pixelDepth: window.screen.pixelDepth,
        viewAreaWidth: pageContent.clientWidth - parseFloat(pageContentStyle.paddingLeft) - parseFloat(pageContentStyle.paddingRight),
        viewAreaHeight: pageContent.clientHeight - parseFloat(pageContentStyle.paddingTop) - parseFloat(pageContentStyle.paddingBottom)
      }
    },
    getAllVars (context) {
      const vars = {}
      if (context.vars) {
        for (const varKey in context.vars) {
          vars[varKey] = context.vars[varKey]
        }
      }
      if (context.varScope) {
        const scopeIDs = context.varScope.split('-')
        for (let scope_idx = 1; scope_idx < scopeIDs.length; scope_idx++) {
          let scopeKey = scopeIDs.slice(0, scope_idx + 1).join('-')
          for (const varKey in context.ctxVars[scopeKey]) {
            vars[varKey] = context.ctxVars[scopeKey][varKey]
          }
        }
      }
      return vars
    }
  }
}
