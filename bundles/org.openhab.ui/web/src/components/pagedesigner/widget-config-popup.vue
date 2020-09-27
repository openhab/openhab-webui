<template>
  <f7-popup ref="widgetConfig" class="widgetconfig-popup" close-on-escape @popup:open="widgetConfigOpened" @popup:closed="widgetConfigClosed">
    <f7-page v-if="component && widget">
      <f7-navbar>
        <f7-nav-left>
          <f7-link icon-ios="f7:arrow_left" icon-md="material:arrow_back" icon-aurora="f7:arrow_left" popup-close></f7-link>
        </f7-nav-left>
        <f7-nav-title>Edit {{widget.label || widget.uid}}</f7-nav-title>
        <f7-nav-right>
          <f7-link @click="updateWidgetConfig" popup-close>Done</f7-link>
        </f7-nav-right>
      </f7-navbar>
      <f7-block v-if="widget.props && config" class="no-margin no-padding">
        <f7-col class="margin-top">
          <config-sheet
            :parameterGroups="widget.props.parameterGroups || []"
            :parameters="widget.props.parameters || []"
            :configuration="config"
            @updated="dirty = true"
          />
        </f7-col>
      </f7-block>
    </f7-page>
  </f7-popup>
</template>

<style lang="stylus">
.widgetconfig-popup .page-content
  overflow-x hidden !important
</style>

<script>
import ConfigSheet from '@/components/config/config-sheet.vue'

export default {
  props: ['opened', 'component', 'widget'],
  components: {
    ConfigSheet
  },
  data () {
    return {
      config: null
    }
  },
  methods: {
    widgetConfigOpened () {
      this.config = JSON.parse(JSON.stringify(this.component.config))
    },
    widgetConfigClosed () {
      this.$f7.emit('widgetConfigClosed')
      this.$emit('closed')
    },
    updateWidgetConfig () {
      this.$f7.emit('widgetConfigUpdate', this.config)
      this.$emit('update', this.config)
    }
  }
}
</script>
