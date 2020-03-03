<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar :title="(!ready) ? '' : (createMode) ? 'Create Widget' : 'Widget: ' + widget.uid" back-link="Back">
      <f7-nav-right>
        <f7-link @click="save()" v-if="$theme.md" icon-md="material:save" icon-only></f7-link>
        <f7-link @click="save()" v-if="!$theme.md">Save<span v-if="$device.desktop">&nbsp;(Ctrl-S)</span></f7-link>
      </f7-nav-right>
    </f7-navbar>
    <f7-toolbar position="bottom">
      <f7-link @click="widgetPropsOpened = true">Set Props<span v-if="$device.desktop">&nbsp;(Ctrl-P)</span></f7-link>
      <f7-link icon-f7="uiwindow_split_2x1" @click="split = (split === 'horizontal') ? 'vertical' : 'horizontal'; blockKey = $f7.utils.id()"></f7-link>
      <f7-link @click="redrawWidget">Redraw<span v-if="$device.desktop">&nbsp;(Ctrl-R)</span></f7-link>
    </f7-toolbar>
    <f7-block :key="blockKey + '-h'" v-if="split === 'horizontal'" class="widget-editor horizontal">
      <f7-row resizable>
        <f7-col style="min-width: 20px" class="widget-code">
          <editor class="widget-component-editor" :mode="'text/x-yaml'" :value="widgetDefinition" @input="(value) => widgetDefinition = value" />
        </f7-col>
      </f7-row>
      <f7-row v-if="ready" resizable>
        <f7-col style="min-width: 20px" class="widget-preview margin-horizontal margin-bottom">
          <generic-widget-component :key="widgetKey" :context="context" @command="onCommand" />
        </f7-col>
      </f7-row>
    </f7-block>
    <f7-block v-else :key="blockKey + 'b'" class="widget-editor vertical">
      <f7-row resizable>
        <f7-col resizable style="min-width: 20px" class="widget-code">
          <editor class="widget-component-editor" :mode="'text/x-yaml'" :value="widgetDefinition" @input="(value) => widgetDefinition = value" />
        </f7-col>
        <f7-col v-if="ready" resizable style="min-width: 20px" class="widget-preview padding-right margin-bottom">
          <generic-widget-component :key="widgetKey" :context="context" @command="onCommand" />
        </f7-col>
      </f7-row>
    </f7-block>

    <f7-popup ref="widgetProps" close-on-escape class="widgetprops-popup" :opened="widgetPropsOpened" @popup:closed="widgetPropsClosed">
      <f7-page v-if="widgetPropsOpened">
        <f7-navbar>
          <f7-nav-left>
            <f7-link icon-ios="f7:arrow_left" icon-md="material:arrow_back" icon-aurora="f7:arrow_left" popup-close></f7-link>
          </f7-nav-left>
          <f7-nav-title>Set Widget Props</f7-nav-title>
          <f7-nav-right>
            <f7-link @click="updateWidgetProps">Done</f7-link>
          </f7-nav-right>
        </f7-navbar>
        <f7-block v-if="widget.props">
          <f7-col>
            <config-sheet
              :parameterGroups="widget.props.parameterGroups || []"
              :parameters="widget.props.parameters || []"
              :configuration="props"
            />
          </f7-col>
        </f7-block>
      </f7-page>
    </f7-popup>
  </f7-page>
</template>

<style lang="stylus">
.widget-editor
  margin-top 0 !important
  padding 0
  height calc(100vh - 2*var(--f7-navbar-height) - var(--f7-toolbar-height) - 2.5*var(--f7-block-margin-vertical))
  .notready
    visibility hidden
  .code-editor-fit
    top 0
    height calc(100% - var(--f7-grid-gap))
  &.vertical
    .row
      height 100%
      .widget-preview
        height 100%
        overflow auto
      .widget-code
        height 100%
  &.horizontal
    .row
      height 50%
</style>

<script>
import YAML from 'yaml'
import { strOptions } from 'yaml/types'

import ConfigSheet from '@/components/config/config-sheet.vue'

strOptions.fold.lineWidth = 0

export default {
  components: {
    'editor': () => import('@/components/config/controls/script-editor.vue'),
    ConfigSheet
  },
  props: ['uid', 'createMode'],
  data () {
    return {
      widgetDefinition: null,
      items: [],
      ready: true,
      split: 'vertical',
      props: {},
      blockKey: this.$f7.utils.id(),
      widgetKey: this.$f7.utils.id(),
      widgetPropsOpened: false
    }
  },
  computed: {
    context () {
      return {
        component: this.widget,
        store: this.$store.getters.trackedItems,
        props: this.props
      }
    },
    widget () {
      try {
        if (!this.widgetDefinition) return {}
        return YAML.parse(this.widgetDefinition, { prettyErrors: true })
      } catch (e) {
        return { component: 'Error', config: { error: e } }
      }
    }
  },
  watch: {
    // widgetDefinition () {
    //   this.redrawWidget()
    // }
  },
  methods: {
    onPageAfterIn () {
      if (window) {
        window.addEventListener('keydown', this.keyDown)
      }
      this.$store.dispatch('startTrackingStates')
      this.load()
    },
    onPageBeforeOut () {
      if (window) {
        window.removeEventListener('keydown', this.keyDown)
      }
      this.$store.dispatch('stopTrackingStates')
    },
    keyDown (ev) {
      if (ev.ctrlKey || ev.metakKey) {
        switch (ev.keyCode) {
          case 80:
            this.widgetPropsOpened = true
            ev.stopPropagation()
            ev.preventDefault()
            break
          case 82:
            this.redrawWidget()
            ev.stopPropagation()
            ev.preventDefault()
            break
          case 83:
            this.save(!this.createMode)
            ev.stopPropagation()
            ev.preventDefault()
            break
        }
      }
    },
    load () {
      if (this.loading) return
      this.loading = true

      if (this.createMode) {
        this.loading = false
        this.ready = true
        this.widgetDefinition = YAML.stringify({
          uid: 'widget_' + this.$f7.utils.id(),
          props: {
            parameterGroups: [],
            parameters: [
              {
                name: 'prop1',
                label: 'Prop 1',
                type: 'TEXT',
                description: 'A text prop'
              },
              {
                name: 'item',
                label: 'Item',
                type: 'TEXT',
                context: 'item',
                description: 'An item to control'
              }
            ]
          },
          tags: [],
          component: 'f7-card',
          config: {
            title: '=(props.item) ? "State of " + props.item : "Set props to test!"',
            footer: '=props.prop1',
            content: '=items[props.item].displayState || items[props.item].state'
          }
        })
      } else {
        this.$oh.api.get('/rest/ui/components/ui:widget/' + this.uid).then((data) => {
          this.$set(this, 'widgetDefinition', YAML.stringify(data))
          this.ready = true
          this.loading = false
        })
      }
    },
    save (stay) {
      if (!this.widget.uid) {
        this.$f7.dialog.alert('Please give an ID to the widget')
        return
      }
      // if (!this.widget.config.label) {
      //   this.$f7.dialog.alert('Please give a label to the widget')
      //   return
      // }
      if (!this.createMode && this.uid !== this.widget.uid) {
        this.$f7.dialog.alert('You cannot change the ID of an existing widget. Duplicate it with the new ID then delete this one.')
        return
      }

      const promise = (this.createMode)
        ? this.$oh.api.postPlain('/rest/ui/components/ui:widget', JSON.stringify(this.widget), 'text/plain', 'application/json')
        : this.$oh.api.put('/rest/ui/components/ui:widget/' + this.widget.uid, this.widget)
      promise.then((data) => {
        if (this.createMode) {
          this.$f7.toast.create({
            text: 'Widget created',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
          this.load()
        } else {
          this.$f7.toast.create({
            text: 'Widget updated',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
        }
        this.$f7.emit('sidebarRefresh', null)
        if (!stay) this.$f7router.back()
      }).catch((err) => {
        this.$f7.toast.create({
          text: 'Error while saving page: ' + err,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
    },
    onCommand (itemName, cmd) {
      this.$store.dispatch('sendCommand', { itemName, cmd })
    },
    redrawWidget () {
      this.widgetKey = this.$f7.utils.id()
      // const wd = this.widgetDefinition
      // this.widgetDefinition = 'component: Label\nnconfig: { text: "Redrawing..."}'
      // this.$nextTick(() => {
      //   this.widgetDefinition = wd
      // })
    },
    widgetPropsClosed () {
      this.widgetPropsOpened = false
    },
    updateWidgetProps () {
      this.widgetPropsClosed()
    }
  }
}
</script>
