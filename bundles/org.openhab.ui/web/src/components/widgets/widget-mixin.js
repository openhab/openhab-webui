// Import into widget components as a mixin!

import expr from 'expression-eval'

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
      return this.context.component.component
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
      const sourceConfig = this.context.component.config
      let evalConfig = {}
      if (this.context.component.config) {
        for (const key in this.context.component.config) {
          if (key === 'visible' || key === 'visibleTo') continue
          this.$set(evalConfig, key, this.evaluateExpression(key, sourceConfig[key]))
        }
      }
      return evalConfig
    },
    visible () {
      if (this.context.editmode || !this.context.component.config) return true
      const visible = this.evaluateExpression('visible', this.context.component.config.visible)
      const visibleTo = this.context.component.config.visibleTo
      if (visible === undefined && visibleTo === undefined) return true
      if (visible === false) return false
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
  methods: {
    evaluateExpression (key, value) {
      if (typeof value === 'string' && value.startsWith('=')) {
        try {
          // we cache the parsed abstract tree to prevent it from being parsed again at runtime
          // in we're edit mode according to the context do not cache because the expression is subject to change
          if (!this.exprAst[key] || this.context.editmode) {
            this.exprAst[key] = expr.parse(value.substring(1))
          }
          return expr.eval(this.exprAst[key], {
            items: this.context.store,
            props: this.context.props,
            vars: this.context.vars,
            Math: Math,
            Number: Number,
            theme: this.$theme,
            themeOptions: this.$f7.data.themeOptions,
            device: this.$device,
            JSON: JSON
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
      } else {
        return value
      }
    },
    childContext (component) {
      return {
        component: component,
        props: this.context.props,
        vars: this.context.vars,
        store: this.context.store,
        config: this.context.config,
        editmode: this.context.editmode,
        clipboardtype: this.context.clipboardtype,
        parent: this.context
      }
    },
    childWidgetContext () {
      if (!this.componentType.startsWith('widget:')) return null
      const widget = this.$store.getters.widget(this.componentType.substring(7))
      if (!widget) {
        console.warn('widget not found, cannot render: ' + this.componentType)
      }
      if (this.context.vars) {
        for (const varKey in this.context.vars) {
          this.$set(this.widgetVars, varKey, this.context.vars[varKey])
        }
      }
      const widgetContext = {
        component: widget,
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
