// Import into widget components as a mixin!

import expr from 'jse-eval'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import calendar from 'dayjs/plugin/calendar'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import isoWeek from 'dayjs/plugin/isoWeek'
import isToday from 'dayjs/plugin/isToday'
import isYesterday from 'dayjs/plugin/isYesterday'
import isTomorrow from 'dayjs/plugin/isTomorrow'
import scope from 'scope-css'
import store from '@/js/store'

import jsepRegex from '@jsep-plugin/regex'
import jsepArrow from '@jsep-plugin/arrow'
import jsepObject from '@jsep-plugin/object'
import jsepTemplate from '@jsep-plugin/template'
expr.jsep.plugins.register(jsepRegex, jsepArrow, jsepObject, jsepTemplate)

expr.addUnaryOp('@', (itemName) => {
  const itemState = store.getters.trackedItems[itemName]
  if (itemState.displayState === undefined) return itemState.state
  return itemState.displayState
})
expr.addUnaryOp('@@', (itemName) => {
  return store.getters.trackedItems[itemName].state
})

dayjs.extend(relativeTime)
dayjs.extend(calendar)
dayjs.extend(localizedFormat)
dayjs.extend(isoWeek)
dayjs.extend(isToday)
dayjs.extend(isYesterday)
dayjs.extend(isTomorrow)

export default {
  props: ['context'],
  data () {
    return {
      exprAst: {},
      vars: (this.context) ? this.context.vars : {},
      widgetVars: {}
    }
  },
  computed: {
    componentType () {
      return this.evaluateExpression('type', this.context.component.component)
    },
    childWidgetComponentType () {
      if (!this.componentType.startsWith('widget:')) return null
      const widget = this.$store.getters.widget(this.componentType.substring(7))
      if (!widget) {
        console.warn('widget not found, cannot render: ' + this.componentType)
      }
      return widget.component
    },
    config () {
      if (!this.context || !this.context.component) return null
      let evalConfig = {}
      // Fallback to modelConfig for oh- components to allow configuring them in modals
      const sourceConfig = this.context.component.config || (this.componentType.startsWith('oh-') ? this.context.modalConfig : {})
      if (sourceConfig) {
        if (typeof sourceConfig !== 'object') return {}
        for (const key in sourceConfig) {
          if (key === 'visible' || key === 'visibleTo' || key === 'stylesheet') continue
          this.$set(evalConfig, key, this.evaluateExpression(key, sourceConfig[key]))
        }
      }
      return evalConfig
    },
    props () {
      if (!this.context || !this.context.component) return {}
      if (this.context.component.props && this.context.component.props.parameters) {
        let defaultValues = {}
        this.context.component.props.parameters.forEach((p) => {
          if (p.default !== undefined) {
            defaultValues[p.name] = p.default
          }
        })
        return Object.assign({}, defaultValues, this.context.props || {})
      } else {
        return this.context.props || {}
      }
    },
    visible () {
      if (this.context.editmode || !this.context.component.config) return true
      const visible = this.evaluateExpression('visible', this.context.component.config.visible)
      const visibleTo = this.context.component.config.visibleTo
      if (visible === undefined && visibleTo === undefined) return true
      if (visible === false || visible === 'false') return false
      if (visibleTo) {
        const user = this.$store.getters.user
        if (!user) return false
        if (user.roles && user.roles.some(r => visibleTo.indexOf('role:' + r) >= 0)) return true
        if (visibleTo.indexOf('user:' + user.name) >= 0) return true
        return false
      }
      return true
    }
  },
  mounted () {
    if (this.context && this.context.component.config && this.context.component.config.stylesheet) {
      this.cssUid = 'scoped-' + this.$f7.utils.id()

      this.$el.classList.add(this.cssUid)

      let style = document.createElement('style')
      style.id = this.cssUid
      style.innerHTML = scope(this.context.component.config.stylesheet, '.' + this.cssUid)
      document.head.appendChild(style)
    }
  },
  beforeDestroy () {
    if (this.cssUid) {
      const scoped_stylesheet = document.getElementById(this.cssUid)
      if (scoped_stylesheet) scoped_stylesheet.remove()
    }
  },
  methods: {
    evaluateExpression (key, value, context) {
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
            props: this.props,
            config: ctx.component.config,
            vars: ctx.vars,
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
    childContext (component) {
      return {
        component: component,
        rootcomponent: this.context.root || this.context.component,
        props: this.props,
        vars: this.context.vars,
        loop: this.context.loop,
        store: this.context.store,
        config: this.context.config,
        editmode: this.context.editmode,
        clipboardtype: this.context.clipboardtype,
        parent: this.context
      }
    },
    childWidgetContext () {
      if (!this.componentType.startsWith('widget:')) return null
      let widget = this.$store.getters.widget(this.componentType.substring(7))
      if (!widget) {
        console.warn('widget not found, cannot render: ' + this.componentType)
      }
      if (this.context.vars) {
        for (const varKey in this.context.vars) {
          this.$set(this.widgetVars, varKey, this.context.vars[varKey])
        }
      }
      if (this.context.component.slots) Object.assign(widget.slots, this.context.component.slots)
      const widgetContext = {
        component: widget,
        root: widget,
        props: this.config,
        vars: this.widgetVars,
        store: this.context.store,
        config: this.context.config,
        editmode: this.context.editmode,
        clipboardtype: this.context.clipboardtype,
        parent: this.context.parent
      }
      return widgetContext
    },
    onCommand (itemName, cmd) {
      this.$store.dispatch('sendCommand', { itemName, cmd })
    }
  }
}
