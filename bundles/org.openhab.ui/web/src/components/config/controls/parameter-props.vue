<template>
  <ul>
    <f7-list-item :title="configDescription.label" link="#" @click="openPropsSheet" />
  </ul>
</template>

<script>
import { f7 } from 'framework7-vue'
import { useComponentsStore } from '@/js/stores/useComponentsStore'
import PropsEditorPopup from './props-editor-popup.vue'

export default {
  props: {
    configDescription: Object,
    value: String,
    parameters: Array,
    configuration: Object,
    f7router: Object
  },
  emits: ['input'],
  data () {
    return {
      propsSheetOpened: false,
      config: {}
    }
  },
  computed: {
    configureTarget () {
      const modalRefParam = this.parameters.find((p) => p.groupName === this.configDescription.groupName && p.context === 'pagewidget')
      if (!modalRefParam) {
        console.warn('Cannot find related parameter to configure props')
        return null
      }
      return this.configuration[modalRefParam.name]
    },
    props () {
      if (!this.configureTarget) return null
      if (this.configureTarget.indexOf('page:') === 0) {
        const page = useComponentsStore().page(this.configureTarget.substring(5))
        if (!page) {
          console.warn('Page not found: ' + this.configureTarget)
          return
        }
        return page.props
      } else if (this.configureTarget.indexOf('widget:') === 0) {
        const widget = useComponentsStore().widget(this.configureTarget.substring(7))
        if (!widget) {
          console.warn('Widget not found: ' + this.configureTarget)
          return
        }
        return widget.props
      }

      console.warn('Invalid prop configuration target')
      return null
    },
    actualValue () {
      if (typeof (this.value) === 'string') {
        return this.value === 'true'
      }
      return this.value
    }
  },
  methods: {
    openPropsSheet () {
      this.config = Object.assign({}, this.value)
      const popup = {
        component: PropsEditorPopup
      }

      this.f7router.navigate({
        url: 'configure-props',
        route: {
          path: 'configure-props',
          popup
        }
      }, {
        props: {
          props: this.props,
          config: this.config
        }
      })

      f7.once('propsEditorUpdate', this.updateProps)
      f7.once('propsEditorClosed', () => {
        f7.off('propsEditorUpdate', this.updateProps)
      })
    },
    propsSheetClosed () {
      this.propsSheetOpened = false
    },
    updateProps (config) {
      this.$emit('input', Object.assign({}, config))
    }
  }
}
</script>
