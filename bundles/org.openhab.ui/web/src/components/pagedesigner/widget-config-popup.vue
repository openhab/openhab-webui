<template>
  <f7-popup ref="widgetConfig"
            class="widgetconfig-popup"
            :close-by-backdrop-click="false"
            @popup:opened="widgetConfigOpened"
            @popup:closed="widgetConfigClosed">
    <f7-page v-if="component && widget">
      <f7-navbar ref="navbar">
        <f7-nav-left>
          <f7-link icon-ios="f7:arrow_left"
                   icon-md="material:arrow_back"
                   icon-aurora="f7:arrow_left"
                   @click="closeWithDirtyCheck" />
        </f7-nav-left>
        <f7-nav-title>Edit {{ widget.label || widget.uid }}{{ dirtyIndicator }}</f7-nav-title>
        <f7-nav-right>
          <f7-link v-if="dirty" @click="reset">
            Reset
          </f7-link>
          <f7-link v-if="dirty" @click="save">
            Save
          </f7-link>
          <f7-link v-else popup-close>
            Close
          </f7-link>
        </f7-nav-right>
      </f7-navbar>
      <f7-block v-if="widget.props && config" class="no-margin no-padding">
        <f7-col class="margin-top">
          <config-sheet
            :parameterGroups="widget.props.parameterGroups || []"
            :parameters="widget.props.parameters || []"
            :configuration="config"
            @updated="updated" />
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
import DirtyMixin from '@/pages/settings/dirty-mixin'
import cloneDeep from 'lodash/cloneDeep'
import fastDeepEqual from 'fast-deep-equal/es6'
import MovablePopupMixin from '@/pages/settings/movable-popup-mixin'

export default {
  mixins: [DirtyMixin, MovablePopupMixin],
  props: ['opened', 'component', 'widget'],
  components: {
    ConfigSheet
  },
  data () {
    return {
      originalConfig: null,
      updateTimer: null,
      leaveCancelled: false,
      config: null
    }
  },
  methods: {
    widgetConfigOpened () {
      this.config = cloneDeep(this.component.config)
      this.originalConfig = cloneDeep(this.component.config)
      this.initializeMovablePopup(this.$refs.widgetConfig, this.$refs.navbar)
      window.addEventListener('keydown', this.onKeydown)
    },
    widgetConfigClosed () {
      this.cleanupMovablePopup()
      window.removeEventListener('keydown', this.onKeydown)
      this.$f7.emit('widgetConfigClosed')
      this.$emit('closed')
    },
    onKeydown (evt) {
      if (evt.key === 'Escape' && !this.leaveCancelled) {
        this.closeWithDirtyCheck()
      }
    },
    closeWithDirtyCheck () {
      if (this.dirty) {
        const dialog = this.confirmLeaveWithoutSaving(
          () => {
            this.updateWidgetConfig(this.originalConfig)
            this.$refs.widgetConfig.close()
          },
          () => {
            // prevent re-triggering the confirm dialog when ESC is pressed to close the dialog
            this.leaveCancelled = true
            setTimeout(() => { this.leaveCancelled = false }, 100)
          }
        )
      } else {
        this.$refs.widgetConfig.close()
      }
    },
    reset () {
      this.$f7.dialog.confirm('Do you want to revert your changes?', 'Revert Changes', () => {
        this.config = cloneDeep(this.originalConfig)
        this.updateWidgetConfig(this.originalConfig)
        this.dirty = false
      })
    },
    save () {
      this.updateWidgetConfig(this.config)
      this.$refs.widgetConfig.close()
    },
    updateWidgetConfig (config) {
      const newConfig = cloneDeep(config)
      this.$f7.emit('widgetConfigUpdate', newConfig)
      this.$emit('update', newConfig)
    },
    updated () {
      this.dirty = !fastDeepEqual(this.config, this.originalConfig)
      clearTimeout(this.updateTimer)
      this.updateTimer = setTimeout(() => {
        this.updateWidgetConfig(this.config)
      }, 500)
    }
  }
}
</script>
