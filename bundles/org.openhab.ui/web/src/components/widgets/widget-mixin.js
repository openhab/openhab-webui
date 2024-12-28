// Import into widget components as a mixin!

import scope from 'scope-css'
import WidgetExpressionMixin from '@/components/widgets/widget-expression-mixin'

export default {
  mixins: [WidgetExpressionMixin],
  props: ['context'],
  data () {
    return {
      vars: (this.context) ? this.context.vars : {},
      ctxVars: (this.context) ? this.context.ctxVars : {},
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
          if (key === 'visible' || key === 'visibleTo' || key === 'stylesheet' || key === 'constants') continue
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
    if (this.context && this.context.component && this.context.component.config && this.context.component.config.stylesheet) {
      if (!this.$el.classList) return // widget is not rendered yet, skip scoped styling

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
    childContext (component) {
      return {
        component,
        rootcomponent: this.context.root || this.context.component,
        props: this.props,
        fn: this.context.fn,
        const: this.context.const,
        vars: this.context.vars,
        varScope: this.varScope || this.context.varScope,
        ctxVars: this.context.ctxVars,
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
        fn: this.context.fn,
        const: this.context.const,
        vars: this.widgetVars,
        varScope: this.varScope || this.context.varScope,
        ctxVars: this.context.ctxVars,
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
