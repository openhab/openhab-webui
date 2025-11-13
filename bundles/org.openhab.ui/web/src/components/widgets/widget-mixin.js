// Import into widget components as a mixin!

import { f7 } from 'framework7-vue'
import { mapStores } from 'pinia'

import scope from 'scope-css'

import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'
import { useUserStore } from '@/js/stores/useUserStore'
import { useComponentsStore } from '@/js/stores/useComponentsStore'
import { useWidgetExpression } from '@/components/widgets/useWidgetExpression.ts'

export default {
  props: {
    context: Object
  },
  data () {
    return {
      vars: (this.context) ? this.context.vars : {},
      ctxVars: (this.context) ? this.context.ctxVars : {},
      widgetVars: {},
      varScope: null,
      widgetExpression: useWidgetExpression()
    }
  },
  computed: {
    componentType () {
      return this.evaluateExpression('type', this.context.component.component)
    },
    childWidgetComponentType () {
      if (!this.componentType.startsWith('widget:')) return null
      const widget = useComponentsStore().widget(this.componentType.substring(7))
      if (!widget) {
        console.warn('widget not found, cannot render: ' + this.componentType)
      }
      return widget.component
    },
    config () {
      if (!this.context?.component) return null
      let evalConfig = {}
      // Fallback to modelConfig for oh- components to allow configuring them in modals
      const sourceConfig = this.context.component.config || (this.componentType.startsWith('oh-') ? this.context.modalConfig : {})
      if (sourceConfig) {
        if (typeof sourceConfig !== 'object') return {}
        for (const key in sourceConfig) {
          if (key === 'visible' || key === 'visibleTo' || key === 'stylesheet' || key === 'constants') continue
          evalConfig[key] = this.evaluateExpression(key, sourceConfig[key])
        }
      }
      return evalConfig
    },
    props () {
      if (!this.context?.component) return {}
      if (this.context.component.props?.parameters) {
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
        const user = useUserStore().user
        if (!user) return false
        if (user.roles && user.roles.some((r) => visibleTo.indexOf('role:' + r) >= 0)) return true
        return visibleTo.indexOf('user:' + user.name) >= 0
      }
      return true
    },
    hasAction () {
      return this.config && (this.config.action || this.config.actionPropsParameterGroup)
    },
    ...mapStores(useUIOptionsStore)
  },
  mounted () {
    if (this.context?.component?.config?.stylesheet) {
      if (this.$refs.component && this.$refs.component.$el) {
        this.cssUid = 'scoped-' + f7.utils.id()

        this.$refs.component.$el.classList.add(this.cssUid)

        let style = document.createElement('style')
        style.id = this.cssUid
        style.innerHTML = scope(this.context.component.config.stylesheet, '.' + this.cssUid)
        document.head.appendChild(style)
      }
    }
  },
  beforeUnmount () {
    if (this.cssUid) {
      const scoped_stylesheet = document.getElementById(this.cssUid)
      if (scoped_stylesheet) scoped_stylesheet.remove()
    }
  },
  methods: {
    evaluateExpression (key, value, context, props) {
      return this.widgetExpression.evaluateExpression(key, value, context || this.context, props || this.props)
    },
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
      let widget = useComponentsStore().widget(this.componentType.substring(7))
      if (!widget) {
        console.warn('widget not found, cannot render: ' + this.componentType)
      }
      if (this.context.vars) {
        for (const varKey in this.context.vars) {
          this.widgetVars[varKey] = this.context.vars[varKey]
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
    }
  }
}
