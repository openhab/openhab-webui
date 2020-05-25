// Import into widget components as a mixin!

import expr from 'expression-eval'

export default {
  props: ['context'],
  data () {
    return {
      exprAst: {}
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
      const sourceConfig = this.context.component.config
      let evalConfig = {}
      if (this.context.component.config) {
        for (const key in this.context.component.config) {
          if (typeof sourceConfig[key] === 'string' && sourceConfig[key].startsWith('=')) {
            try {
              // we cache the parsed abstract tree to prevent it from being parsed again at runtime
              // in we're edit mode according to the context do not cache because the expression is subject to change
              if (!this.exprAst[key] || this.context.editmode) {
                this.exprAst[key] = expr.parse(sourceConfig[key].substring(1))
              }
              evalConfig[key] = expr.eval(this.exprAst[key], {
                items: this.context.store,
                props: this.context.props,
                Math: Math,
                theme: this.$theme,
                themeOptions: this.$f7.data.themeOptions,
                device: this.$device,
                JSON: JSON
              })
            } catch (e) {
              evalConfig[key] = e
            }
          } else {
            evalConfig[key] = sourceConfig[key]
          }
        }
      }
      this.$emit('component-ready', this.context.component)
      return evalConfig
    },
    visible () {
      if (this.context.editmode) return true
      if (this.config.visible === undefined && this.config.visibleTo === undefined) return true
      if (this.config.visible === false) return false
      if (this.config.visibleTo) {
        const user = this.$store.getters.user
        if (!user) return false
        if (user.roles && user.roles.some(r => this.config.visibleTo.indexOf('role:' + r) >= 0)) return true
        if (this.config.visibleTo.indexOf('user:' + user.name) >= 0) return true
        return false
      }
      return true
    }
  },
  methods: {
    childContext (component) {
      return {
        component: component,
        props: this.context.props,
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
      return {
        component: widget,
        props: this.config,
        store: this.context.store,
        config: this.context.config,
        editmode: this.context.editmode,
        clipboardtype: this.context.clipboardtype,
        parent: this.context.parent
      }
    },
    onCommand (itemName, cmd) {
      this.$store.dispatch('sendCommand', { itemName, cmd })
    }
  }
}
