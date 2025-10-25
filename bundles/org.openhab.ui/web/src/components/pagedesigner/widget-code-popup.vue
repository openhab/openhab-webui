<template>
  <f7-popup ref="widgetCode"
            class="widgetcode-popup"
            :close-by-backdrop-click="false"
            @popup:open="widgetCodeOpened"
            @popup:closed="widgetCodeClosed">
    <f7-page v-if="component && code">
      <f7-navbar ref="navbar">
        <f7-nav-left>
          <f7-link icon-ios="f7:arrow_left"
                   icon-md="material:arrow_back"
                   icon-aurora="f7:arrow_left"
                   @click="closeWithDirtyCheck" />
        </f7-nav-left>
        <f7-nav-title>Edit Widget Code{{ dirtyIndicator }}</f7-nav-title>
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
      <editor class="page-code-editor"
              :mode="`application/vnd.openhab.uicomponent+yaml;type=${componentType || 'widget'}`"
              :value="code"
              @input="update" />
      <!-- <pre class="yaml-message padding-horizontal" :class="[widgetYamlError === 'OK' ? 'text-color-green' : 'text-color-red']">{{widgetYamlError}}</pre> -->
    </f7-page>
  </f7-popup>
</template>

<style lang="stylus">
.widgetcode-popup
  .page-code-editor.vue-codemirror
    display block
    top calc(var(--f7-navbar-height))
    height calc(100% - var(--f7-navbar-height))
    width 100%
  .yaml-message
    display block
    position absolute
    top 80%
    white-space pre-wrap
</style>

<script>
import { f7 } from 'framework7-vue'
import { nextTick, defineAsyncComponent } from 'vue'

import YAML from 'yaml'
import DirtyMixin from '@/pages/settings/dirty-mixin'
import MovablePopupMixin from '@/pages/settings/movable-popup-mixin'

export default {
  props: {
    component: Object,
    componentType: String
  },
  mixins: [DirtyMixin, MovablePopupMixin],
  components: {
    editor: defineAsyncComponent(() => import(/* webpackChunkName: "script-editor" */ '@/components/config/controls/script-editor.vue'))
  },
  emits: ['update', 'closed'],
  data () {
    return {
      leaveCancelled: false,
      updateTimer: null,
      originalCode: null,
      code: null
    }
  },
  computed: {
    widgetYamlError () {
      try {
        YAML.parse(this.code, { prettyErrors: true })
        return 'OK'
      } catch (e) {
        return e
      }
    }
  },
  methods: {
    widgetCodeOpened () {
      this.code = YAML.stringify(this.component)
      this.originalCode = this.code
      nextTick(() => {
        // this.$refs.navbar only exists after the code editor finished rendering
        this.initializeMovablePopup(this.$refs.widgetCode, this.$refs.navbar)
      })
      window.addEventListener('keydown', this.onKeydown)
    },
    widgetCodeClosed () {
      this.cleanupMovablePopup()
      window.removeEventListener('keydown', this.onKeydown)
      f7.emit('widgetCodeClosed')
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
            this.updateWidgetCode(this.originalCode)
            this.$refs.widgetCode.$el.f7Modal.close()
          },
          () => {
            // prevent re-triggering the confirm dialog when ESC is pressed to close the dialog
            this.leaveCancelled = true
            setTimeout(() => { this.leaveCancelled = false }, 100)
          }
        )
      } else {
        this.$refs.widgetCode.$el.f7Modal.close()
      }
    },
    reset () {
      f7.dialog.confirm('Do you want to revert your changes?', 'Revert Changes', () => {
        this.code = this.originalCode
        this.updateWidgetCode(this.code)
        this.dirty = false
      })
    },
    save () {
      if (this.widgetYamlError !== 'OK') {
        f7.dialog.alert('Invalid YAML: ' + this.widgetYamlError, 'Unable to save changes').open()
        return
      }
      this.updateWidgetCode(this.code)
      this.$refs.widgetCode.$el.f7Modal.close()
    },
    updateWidgetCode (value) {
      f7.emit('widgetCodeUpdate', value)
      this.$emit('update', value)
    },
    update (value) {
      this.code = value
      clearTimeout(this.updateTimer)
      this.updateTimer = setTimeout(() => {
        // Since update will be called on every key stroke, debounce the dirty check too
        this.dirty = this.code !== this.originalCode
        if (this.widgetYamlError === 'OK') {
          this.updateWidgetCode(this.code)
        }
      }, 200)
    }
  }
}
</script>
