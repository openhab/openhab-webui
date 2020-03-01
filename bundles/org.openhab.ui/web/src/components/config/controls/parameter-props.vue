<template>
  <ul>
    <f7-list-item :title="configDescription.label" link="#" @click="openPropsSheet">
    </f7-list-item>
    <f7-popup ref="propSheet" close-on-escape class="widgetprops-popup" :opened="propsSheetOpened" @popup:closed="propsSheetClosed">
      <f7-page v-if="propsSheetOpened">
        <f7-navbar>
          <f7-nav-left>
            <f7-link icon-ios="f7:arrow_left" icon-md="material:arrow_back" icon-aurora="f7:arrow_left" @click="$refs.propSheet.f7Popup.close()"></f7-link>
          </f7-nav-left>
          <f7-nav-title>Set Component Props</f7-nav-title>
          <f7-nav-right>
            <f7-link @click="updateProps">Done</f7-link>
          </f7-nav-right>
        </f7-navbar>
        <f7-block v-if="props">
          <f7-col>
            <config-sheet
              :parameterGroups="props.parameterGroups || []"
              :parameters="props.parameters || []"
              :configuration="config"
            />
          </f7-col>
        </f7-block>
      </f7-page>
    </f7-popup>
  </ul>
</template>

<script>
// import ConfigSheet from '@/components/config/config-sheet.vue'

export default {
  components: {
    'config-sheet': () => import('@/components/config/config-sheet.vue')
  },
  props: ['configDescription', 'value', 'parameters', 'configuration'],
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
        const page = this.$store.getters.page(this.configureTarget.substring(5))
        if (!page) {
          console.warn('Page not found: ' + this.configureTarget)
          return
        }
        return page.props
      } else if (this.configureTarget.indexOf('widget:') === 0) {
        const widget = this.$store.getters.widget(this.configureTarget.substring(7))
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
      this.propsSheetOpened = true
    },
    propsSheetClosed () {
      this.propsSheetOpened = false
    },
    updateProps () {
      this.$emit('input', Object.assign({}, this.config))
      this.$refs.propSheet.f7Popup.close()
    }
  }
}
</script>
