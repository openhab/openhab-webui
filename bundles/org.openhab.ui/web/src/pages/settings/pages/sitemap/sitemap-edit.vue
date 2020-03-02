<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar :title="(!ready) ? '' : (createMode) ? 'Create sitemap' : 'Sitemap: ' + sitemap.config.label" back-link="Back" no-hairline>
      <f7-nav-right>
        <f7-link @click="save()" v-if="$theme.md" icon-md="material:save" icon-only></f7-link>
        <f7-link @click="save()" v-if="!$theme.md">Save<span v-if="$device.desktop">&nbsp;(Ctrl-S)</span></f7-link>
      </f7-nav-right>
    </f7-navbar>
    <f7-toolbar tabbar position="top">
      <f7-link @click="currentTab = 'tree'" :tab-link-active="currentTab === 'tree'" class="tab-link">Design</f7-link>
      <f7-link @click="currentTab = 'code'" :tab-link-active="currentTab === 'code'" class="tab-link">Code</f7-link>
    </f7-toolbar>
    <f7-toolbar bottom class="toolbar-details" v-show="currentTab === 'tree'">
      <f7-link class="left details-link" @click="detailsOpened = true">Details</f7-link>
      <f7-link :disabled="selectedWidget != null" class="right" @click="selectedWidget = null">Clear</f7-link>
    </f7-toolbar>
    <f7-tabs class="sitemap-editor-tabs">
      <f7-tab id="tree" @tab:show="() => this.currentTab = 'tree'" :tab-active="currentTab === 'tree'">
        <f7-block v-if="!ready" class="text-align-center">
          <f7-preloader></f7-preloader>
          <div>Loading...</div>
        </f7-block>
        <f7-block v-else class="sitemap-tree-wrapper" :class="{ 'sheet-opened' : detailsOpened }">
          <f7-row v-if="currentTab === 'tree'">
            <f7-col width="100" medium="50">
              <f7-block strong class="sitemap-tree" no-gap @click.native="clearSelection">
                <f7-treeview>
                  <sitemap-treeview-item :widget="sitemap" @selected="selectWidget" :selected="selectedWidget">
                  </sitemap-treeview-item>
                </f7-treeview>
              </f7-block>
            </f7-col>
            <f7-col width="100" medium="50" class="details-pane">
              <f7-block v-if="selectedWidget" no-gap>
                <widget-details :widget="selectedWidget" :createMode="createMode" @remove="removeWidget" @movedown="moveWidgetDown" @moveup="moveWidgetUp" />
              </f7-block>
              <f7-block v-else>
                <div class="padding text-align-center">Nothing selected</div>
              </f7-block>
              <f7-block v-if="selectedWidget && ['Switch', 'Selection'].indexOf(selectedWidget.component) >= 0">
                <div><f7-block-title>Mappings</f7-block-title></div>
                <mapping-details :widget="selectedWidget" />
              </f7-block>
              <f7-block v-if="selectedWidget && canAddChildren">
                <div><f7-block-title>Add Child Widget</f7-block-title></div>
                <f7-card>
                  <f7-card-content>
                    <f7-list>
                      <f7-list-button color="blue" :title="`Insert Widget Inside ${selectedWidget.component}`" actions-open="#widget-type-selection"></f7-list-button>
                    </f7-list>
                  </f7-card-content>
                </f7-card>
              </f7-block>
            </f7-col>
          </f7-row>
        </f7-block>

        <f7-actions ref="widgetTypeSelection" id="widget-type-selection" :grid="true">
          <f7-actions-group>
            <f7-actions-button v-for="widgetType in widgetTypes" :key="widgetType.type" @click="addWidget(widgetType.type)">
              <f7-icon :f7="widgetType.icon" slot="media" />
              <span>{{widgetType.type}}</span>
            </f7-actions-button>
          </f7-actions-group>
        </f7-actions>
      </f7-tab>
      <f7-tab id="code" @tab:show="() => { this.currentTab = 'code' }" :tab-active="currentTab === 'code'">
        <sitemap-code v-if="currentTab === 'code'" :sitemap="sitemap" @updated="(value) => update(value)" />
      </f7-tab>

    </f7-tabs>

    <f7-fab class="add-to-sitemap-fab" v-if="canAddChildren" position="right-bottom" slot="fixed" color="blue" @click="$refs.widgetTypeSelection.open()">
      <f7-icon ios="f7:plus" md="material:add" aurora="f7:plus"></f7-icon>
      <f7-icon ios="f7:multiply" md="material:close" aurora="f7:multiply"></f7-icon>
    </f7-fab>

    <f7-sheet class="sitemap-details-sheet" :backdrop="false" :close-on-escape="true" :opened="detailsOpened" @sheet:closed="detailsOpened = false">
      <f7-page>
        <f7-toolbar tabbar>
          <f7-link class="padding-left padding-right" :tab-link-active="detailsTab === 'item'" @click="detailsTab = 'widget'">Widget</f7-link>
          <f7-link class="padding-left padding-right" :tab-link-active="detailsTab === 'mappings'" @click="detailsTab = 'mappings'">Mappings</f7-link>
          <div class="right">
            <f7-link sheet-close class="padding-right"><f7-icon f7="chevron_down"></f7-icon></f7-link>
          </div>
        </f7-toolbar>
        <f7-block style="margin-bottom: 6rem" v-if="selectedWidget && detailsTab === 'widget'">
          <widget-details :widget="selectedWidget" :createMode="createMode" @remove="removeWidget" @movedown="moveWidgetDown" @moveup="moveWidgetUp" />
        </f7-block>
        <f7-block style="margin-bottom: 6rem" v-if="selectedWidget && detailsTab === 'mappings' && ['Switch', 'Selection'].indexOf(selectedWidget.component) >= 0">
          <mapping-details :widget="selectedWidget" />
        </f7-block>
      </f7-page>
    </f7-sheet>

  </f7-page>
</template>

<style lang="stylus">
.sitemap-editor-tabs
  --f7-grid-gap 0px
  height calc(100% - var(--f7-toolbar-height))
  .tab
    height 100%

.sitemap-tree-wrapper
  padding 0
  margin-bottom 0
.sitemap-tree
  padding 0
  border-right 1px solid var(--f7-block-strong-border-color)
  .treeview
    --f7-treeview-item-height 40px
    .treeview-item-label
      font-size 10pt
      white-space nowrap
      overflow-x hidden
    .subtitle
      font-size 8pt
      color var(--f7-list-item-footer-text-color)
.sitemap-details-sheet
  z-index 10900
.md .sitemap-details-sheet .toolbar .link
  width 35%

@media (min-width: 768px)
  .sitemap-tree-wrapper
    height 100%
    .row
      height 100%
      .col-100
        height 100%
        overflow auto
        .sitemap-tree
          min-height 100%
          margin 0
          height auto
      .details-pane
        padding-top 0
        .block
          margin-top 0
  .toolbar-details
    .details-link
      visibility hidden !important
  .add-to-sitemap-fab
    visibility hidden !important

@media (max-width: 767px)
  .details-pane
    display none
  .sitemap-tree-wrapper.sheet-opened
    margin-bottom var(--f7-sheet-height)
  .details-sheet
    height calc(1.4*var(--f7-sheet-height))
</style>

<script>
import SitemapCode from '@/components/pagedesigner/sitemap/sitemap-code.vue'
import WidgetDetails from '@/components/pagedesigner/sitemap/widget-details.vue'
import MappingDetails from '@/components/pagedesigner/sitemap/mapping-details.vue'

function uuidv4 () {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

export default {
  components: {
    SitemapCode,
    WidgetDetails,
    MappingDetails
  },
  props: ['createMode', 'uid'],
  data () {
    return {
      ready: false,
      loading: false,
      sitemap: {
        uid: 'page_' + uuidv4().split('-')[0],
        component: 'Sitemap',
        config: {
          label: 'New Sitemap'
        },
        tags: [],
        slots: { widgets: [] }
      },
      selectedWidget: null,
      selectedWidgetParent: null,
      previousSelection: null,
      detailsOpened: false,
      detailsTab: 'widget',
      currentTab: 'tree',
      eventSource: null,
      widgetTypes: [
        { type: 'Text', icon: 'textformat' },
        { type: 'Switch', icon: 'power' },
        { type: 'Selection', icon: 'text_justify' },
        { type: 'Slider', icon: 'slider_horizontal_3' },
        { type: 'Frame', icon: 'macwindow' },
        { type: 'Setpoint', icon: 'plus_slash_minus' },
        { type: 'Default', icon: 'rectangle' },
        { type: 'Group', icon: 'square_stack_3d_down_right' },
        { type: 'Chart', icon: 'chart_bar_square' },
        { type: 'Webview', icon: 'globe' },
        { type: 'Colorpicker', icon: 'drop' },
        { type: 'Mapview', icon: 'map' },
        { type: 'List', icon: 'square_list' },
        { type: 'Image', icon: 'photo' },
        { type: 'Video', icon: 'videocam' }
      ],
      linkableWidgetTypes: ['Sitemap', 'Text', 'Frame', 'Group', 'Image']
    }
  },
  created () {

  },
  computed: {
    canAddChildren () {
      if (!this.selectedWidget) return false
      if (this.linkableWidgetTypes.indexOf(this.selectedWidget.component) < 0) return false
      return true
    }
  },
  methods: {
    onPageAfterIn () {
      if (window) {
        window.addEventListener('keydown', this.keyDown)
      }
      this.load()
    },
    onPageBeforeOut () {
      if (window) {
        window.removeEventListener('keydown', this.keyDown)
      }
      this.detailsOpened = false
    },
    keyDown (ev) {
      if (ev.keyCode === 83 && (ev.ctrlKey || ev.metaKey)) {
        this.save(!this.createMode)
        ev.stopPropagation()
        ev.preventDefault()
      }
    },
    load () {
      if (this.loading) return
      this.loading = true

      if (this.createMode) {
        this.loading = false
        this.ready = true
      } else {
        this.$oh.api.get('/rest/ui/components/system:sitemap/' + this.uid).then((data) => {
          this.$set(this, 'sitemap', data)
          this.ready = true
          this.loading = false
        })
      }
    },
    save (stay) {
      if (!this.sitemap.uid) {
        this.$f7.dialog.alert('Please give an ID to the sitemap')
        return
      }
      if (!this.sitemap.config.label) {
        this.$f7.dialog.alert('Please give a label to the sitemap')
        return
      }
      if (!this.createMode && this.uid !== this.sitemap.uid) {
        this.$f7.dialog.alert('You cannot change the ID of an existing sitemap. Duplicate it with the new ID then delete this one.')
        return
      }

      const promise = (this.createMode)
        ? this.$oh.api.postPlain('/rest/ui/components/system:sitemap', JSON.stringify(this.sitemap), 'text/plain', 'application/json')
        : this.$oh.api.put('/rest/ui/components/system:sitemap/' + this.sitemap.uid, this.sitemap)
      promise.then((data) => {
        if (this.createMode) {
          this.$f7.toast.create({
            text: 'Sitemap created',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
          this.load()
        } else {
          this.$f7.toast.create({
            text: 'Sitemap updated',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
        }
        this.$f7.emit('sidebarRefresh', null)
        if (!stay) this.$f7router.back()
      }).catch((err) => {
        this.$f7.toast.create({
          text: 'Error while saving sitemap: ' + err,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
    },
    cleanConfig (widget) {
      if (widget.config) {
        for (let key in widget.config) {
          if (!widget.config[key]) {
            delete widget.config[key]
          }
        }
      }
      if (widget.slots && widget.slots.widgets) {
        widget.slots.widgets.forEach(this.cleanConfig)
      }
    },
    update (value) {
      this.selectedWidget = null
      this.selectedWidgetParent = null
      this.$set(this, 'sitemap', value)
      this.cleanConfig(this.sitemap)
    },
    startEventSource () {

    },
    stopEventSource () {

    },
    removeWidget () {
      this.selectedWidgetParent.slots.widgets.splice(this.selectedWidgetParent.slots.widgets.indexOf(this.selectedWidget), 1)
      if (!this.selectedWidgetParent.slots.widgets.length) {
        delete this.selectedWidgetParent.slots
      }
      this.selectedWidget = null
      this.selectedWidgetParent = null
    },
    moveWidgetDown () {
      let widgets = this.selectedWidgetParent.slots.widgets
      let pos = widgets.indexOf(this.selectedWidget)
      if (pos >= widgets.length - 1) return
      widgets.splice(pos, 1)
      widgets.splice(pos + 1, 0, this.selectedWidget)
    },
    moveWidgetUp () {
      let widgets = this.selectedWidgetParent.slots.widgets
      let pos = widgets.indexOf(this.selectedWidget)
      if (pos <= 0) return
      widgets.splice(pos, 1)
      widgets.splice(pos - 1, 0, this.selectedWidget)
    },
    selectWidget (widgets) {
      const widget = widgets[0]
      const parentWidget = widgets[1]
      this.selectedWidget = null
      this.selectedWidgetParent = null
      this.$nextTick(() => {
        this.selectedWidget = widget
        this.selectedWidgetParent = parentWidget
      })
    },
    clearSelection (ev) {
      if (ev.target && ev.currentTarget && ev.target === ev.currentTarget) {
        this.selectedWidget = null
        this.selectedWidgetParent = null
      }
    },
    addWidget (widgetType) {
      if (!this.selectedWidget.slots) {
        this.$set(this.selectedWidget, 'slots', { widgets: [] })
      }
      const widget = {
        component: widgetType,
        config: {}
      }
      this.selectedWidget.slots.widgets.push(widget)
      this.selectWidget([widget, this.selectedWidget])
    }
  }
}
</script>
