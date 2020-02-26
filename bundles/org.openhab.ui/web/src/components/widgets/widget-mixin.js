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
              evalConfig[key] = expr.eval(this.exprAst[key], { items: this.context.store, props: this.context.props, Math: Math })
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
    }
  },
  methods: {
    childContext (component) {
      return {
        component: component,
        props: this.context.props,
        store: this.context.store,
        editmode: this.context.editmode,
        clipboardtype: this.context.clipboardtype,
        parent: this.context
      }
    },
    onCommand (itemName, cmd) {
      this.$emit('command', itemName, cmd)
    }
  }
}
