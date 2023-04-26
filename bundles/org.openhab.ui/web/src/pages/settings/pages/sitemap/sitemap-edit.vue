<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar :title="(!ready) ? '' : (createMode) ? 'Create sitemap' : 'Sitemap: ' + sitemap.config.label" back-link="Back" no-hairline>
      <f7-nav-right>
        <f7-link @click="save()" v-if="$theme.md" icon-md="material:save" icon-only />
        <f7-link @click="save()" v-if="!$theme.md">
          Save<span v-if="$device.desktop">&nbsp;(Ctrl-S)</span>
        </f7-link>
      </f7-nav-right>
    </f7-navbar>
    <f7-toolbar tabbar position="top">
      <f7-link @click="currentTab = 'tree'" :tab-link-active="currentTab === 'tree'" class="tab-link">
        Design
      </f7-link>
      <f7-link @click="currentTab = 'code'" :tab-link-active="currentTab === 'code'" class="tab-link">
        Code
      </f7-link>
    </f7-toolbar>
    <f7-toolbar bottom class="toolbar-details" v-if="currentTab === 'tree'">
      <f7-link :disabled="selectedWidget != null" class="left" @click="selectedWidget = null">
        Clear
      </f7-link>
      <f7-link class="right details-link padding-right" ref="detailsLink" @click="detailsOpened = true" icon-f7="chevron_up" />
    </f7-toolbar>
    <f7-tabs class="sitemap-editor-tabs">
      <f7-tab class="design" id="tree" @tab:show="() => this.currentTab = 'tree'" :tab-active="currentTab === 'tree'">
        <f7-block v-if="!ready" class="text-align-center">
          <f7-preloader />
          <div>Loading...</div>
        </f7-block>
        <f7-block v-else class="sitemap-tree-wrapper" :class="{ 'sheet-opened' : detailsOpened }">
          <f7-row v-if="currentTab === 'tree'">
            <f7-col width="100" medium="50">
              <f7-block strong class="sitemap-tree" no-gap @click.native="clearSelection">
                <f7-treeview>
                  <sitemap-treeview-item :widget="sitemap" @selected="selectWidget" :selected="selectedWidget" />
                </f7-treeview>
              </f7-block>
            </f7-col>
            <f7-col width="100" medium="50" class="details-pane">
              <f7-block v-if="selectedWidget" no-gap>
                <widget-details :widget="selectedWidget" :createMode="createMode" @remove="removeWidget" @movedown="moveWidgetDown" @moveup="moveWidgetUp" />
              </f7-block>
              <f7-block v-else>
                <div class="padding text-align-center">
                  Nothing selected
                </div>
              </f7-block>
              <f7-block v-if="selectedWidget && selectedWidget.component !== 'Sitemap'">
                <div><f7-block-title>Visibility</f7-block-title></div>
                <attribute-details :widget="selectedWidget" attribute="visibility" placeholder="item_name operator value" />
              </f7-block>
              <f7-block v-if="selectedWidget && selectedWidget.component !== 'Sitemap'">
                <div><f7-block-title>Label Color</f7-block-title></div>
                <attribute-details :widget="selectedWidget" attribute="labelcolor" placeholder="item_name operator value = color" />
              </f7-block>
              <f7-block v-if="selectedWidget && selectedWidget.component !== 'Sitemap'">
                <div><f7-block-title>Value Color</f7-block-title></div>
                <attribute-details :widget="selectedWidget" attribute="valuecolor" placeholder="item_name operator value = color" />
              </f7-block>
              <f7-block v-if="selectedWidget && selectedWidget.component !== 'Sitemap'">
                <div><f7-block-title>Icon Color</f7-block-title></div>
                <attribute-details :widget="selectedWidget" attribute="iconcolor" placeholder="item_name operator value = color" />
              </f7-block>
              <f7-block v-if="selectedWidget && ['Switch', 'Selection'].indexOf(selectedWidget.component) >= 0">
                <div><f7-block-title>Mappings</f7-block-title></div>
                <attribute-details :widget="selectedWidget" attribute="mappings" placeholder="command = label" />
              </f7-block>
              <f7-block v-if="selectedWidget && canAddChildren">
                <div><f7-block-title>Add Child Widget</f7-block-title></div>
                <f7-card>
                  <f7-card-content>
                    <f7-list>
                      <f7-list-button color="blue" :title="`Insert Widget Inside ${selectedWidget.component}`" actions-open="#widget-type-selection" />
                    </f7-list>
                  </f7-card-content>
                </f7-card>
              </f7-block>
            </f7-col>
          </f7-row>
        </f7-block>

        <f7-actions ref="widgetTypeSelection" id="widget-type-selection" :grid="true">
          <f7-actions-group>
            <f7-actions-button v-for="widgetType in addableWidgetTypes" :key="widgetType.type" @click="addWidget(widgetType.type)">
              <f7-icon :f7="widgetType.icon" slot="media" />
              <span>{{ widgetType.type }}</span>
            </f7-actions-button>
          </f7-actions-group>
        </f7-actions>
      </f7-tab>
      <f7-tab id="code" @tab:show="() => { this.currentTab = 'code' }" :tab-active="currentTab === 'code'">
        <sitemap-code v-if="currentTab === 'code'" :sitemap="sitemap" @updated="(value) => update(value)" />
      </f7-tab>
    </f7-tabs>

    <f7-fab class="add-to-sitemap-fab" v-if="canAddChildren" position="right-bottom" slot="fixed" color="blue" @click="$refs.widgetTypeSelection.open()">
      <f7-icon ios="f7:plus" md="material:add" aurora="f7:plus" />
      <f7-icon ios="f7:multiply" md="material:close" aurora="f7:multiply" />
    </f7-fab>

    <f7-sheet class="sitemap-details-sheet" :backdrop="false" :close-on-escape="true" :opened="detailsOpened" @sheet:closed="detailsOpened = false">
      <f7-page>
        <f7-toolbar tabbar bottom>
          <f7-link class="padding-left padding-right" :tab-link-active="detailsTab === 'widget'" @click="detailsTab = 'widget'">
            Widget
          </f7-link>
          <f7-link class="padding-left padding-right" :tab-link-active="detailsTab === 'mappings'" @click="detailsTab = 'mappings'">
            Mappings
          </f7-link>
          <div class="right">
            <f7-link sheet-close class="padding-right">
              <f7-icon f7="chevron_down" />
            </f7-link>
          </div>
        </f7-toolbar>
        <f7-block style="margin-bottom: 6rem" v-if="selectedWidget && detailsTab === 'widget'">
          <widget-details :widget="selectedWidget" :createMode="createMode" @remove="removeWidget" @movedown="moveWidgetDown" @moveup="moveWidgetUp" />
        </f7-block>
        <f7-block style="margin-bottom: 6rem" v-if="selectedWidget && detailsTab === 'visibility' && selectedWidget.component !== 'Sitemap'">
          <attribute-details :widget="selectedWidget" attribute="visibility" placeholder="item_name operator value" />
        </f7-block>
        <f7-block style="margin-bottom: 6rem" v-if="selectedWidget && detailsTab === 'labelcolor' && selectedWidget.component !== 'Sitemap'">
          <attribute-details :widget="selectedWidget" attribute="labelcolor" placeholder="item_name operator value = color" />
        </f7-block>
        <f7-block style="margin-bottom: 6rem" v-if="selectedWidget && detailsTab === 'valuecolor' && selectedWidget.component !== 'Sitemap'">
          <attribute-details :widget="selectedWidget" attribute="valuecolor" placeholder="item_name operator value = color" />
        </f7-block>
        <f7-block style="margin-bottom: 6rem" v-if="selectedWidget && detailsTab === 'iconcolor' && selectedWidget.component === 'Image'">
          <attribute-details :widget="selectedWidget" attribute="iconcolor" placeholder="item_name operator value = color" />
        </f7-block>
        <f7-block style="margin-bottom: 6rem" v-if="selectedWidget && detailsTab === 'mappings' && ['Switch', 'Selection'].indexOf(selectedWidget.component) >= 0">
          <attribute-details :widget="selectedWidget" attribute="mappings" placeholder="command = label" />
        </f7-block>
      </f7-page>
    </f7-sheet>
  </f7-page>
</template>

<style lang="stylus">
.sitemap-editor-tabs
  height calc(100%)
  overflow hidden
  .tab
    height 100%
  .design
    --f7-grid-gap 0px
    height calc(100% - var(--f7-toolbar-height))

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
  .toolbar
    --f7-theme-color var(--f7-color-blue)
    --f7-theme-color-rgb var(--f7-color-blue-rgb)
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
import AttributeDetails from '@/components/pagedesigner/sitemap/attribute-details.vue'
import DirtyMixin from '../../dirty-mixin'

export default {
  mixins: [DirtyMixin],
  components: {
    SitemapCode,
    WidgetDetails,
    AttributeDetails
  },
  props: ['createMode', 'uid'],
  data () {
    return {
      ready: false,
      loading: false,
      sitemap: {
        uid: 'page_' + this.$f7.utils.id(),
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
        { type: 'Input', icon: 'text_cursor' },
        { type: 'Default', icon: 'rectangle' },
        { type: 'Group', icon: 'square_stack_3d_down_right' },
        { type: 'Chart', icon: 'chart_bar_square' },
        { type: 'Webview', icon: 'globe' },
        { type: 'Colorpicker', icon: 'drop' },
        { type: 'Mapview', icon: 'map' },
        { type: 'Image', icon: 'photo' },
        { type: 'Video', icon: 'videocam' }
      ],
      linkableWidgetTypes: ['Sitemap', 'Text', 'Frame', 'Group', 'Image'],
      widgetTypesRequiringItem: ['Group', 'Chart', 'Switch', 'Mapview', 'Slider', 'Selection', 'Setpoint', 'Input', 'Colorpicker', 'Default']
    }
  },
  created () {

  },
  computed: {
    canAddChildren () {
      if (!this.selectedWidget) return false
      if (this.linkableWidgetTypes.indexOf(this.selectedWidget.component) < 0) return false
      return true
    },
    addableWidgetTypes () {
      if (!this.selectedWidget) return
      // No frames in frame
      if (this.selectedWidget.component === 'Frame') return this.widgetTypes.filter(w => w.type !== 'Frame')
      // Linkable widget types only contain frames or none at all
      if (this.linkableWidgetTypes.includes(this.selectedWidget.component)) {
        if (this.selectedWidget.slots && this.selectedWidget.slots.widgets && this.selectedWidget.slots.widgets.length > 0) {
          if (this.selectedWidget.slots.widgets.find(w => w.component === 'Frame')) {
            return this.widgetTypes.filter(w => w.type === 'Frame')
          } else {
            return this.widgetTypes.filter(w => w.type !== 'Frame')
          }
        } else {
          return this.widgetTypes
        }
      }
      return this.widgetTypes
    }
  },
  watch: {
    sitemap: {
      handler: function () {
        if (!this.loading) {
          this.dirty = true
        }
      },
      deep: true
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
      if (ev.keyCode === 83 && (ev.ctrlKey || ev.metaKey) && !(ev.altKey || ev.shiftKey)) {
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
          this.$nextTick(() => {
            this.ready = true
            this.loading = false
          })
        })
      }
    },
    save (stay, force) {
      this.cleanConfig(this.sitemap)
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

      if (!force && !this.validateWidgets(stay)) return

      const promise = (this.createMode)
        ? this.$oh.api.postPlain('/rest/ui/components/system:sitemap', JSON.stringify(this.sitemap), 'text/plain', 'application/json')
        : this.$oh.api.put('/rest/ui/components/system:sitemap/' + this.sitemap.uid, this.sitemap)
      promise.then((data) => {
        this.dirty = false
        if (this.createMode) {
          this.$f7.toast.create({
            text: 'Sitemap created',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
          this.load()
          this.$f7router.navigate(this.$f7route.url.replace('/add', '/' + this.sitemap.uid), { reloadCurrent: true })
        } else {
          this.$f7.toast.create({
            text: 'Sitemap updated',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
        }
        this.$f7.emit('sidebarRefresh', null)
        // if (!stay) this.$f7router.back()
      }).catch((err) => {
        this.$f7.toast.create({
          text: 'Error while saving sitemap: ' + err,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
    },
    validateWidgets (stay) {
      if (this.sitemap.slots && Array.isArray(this.sitemap.slots.widgets)) {
        let validationWarnings = []
        const widgetList = this.sitemap.slots.widgets.reduce(function iter (widgets, widget) {
          widgets.push(widget)
          if (widget.slots && Array.isArray(widget.slots.widgets)) {
            return widget.slots.widgets.reduce(iter, widgets)
          }
          return widgets
        }, [])
        let isFrame = [false]
        let siblingIsFrame = [undefined]
        this.sitemap.slots.widgets.forEach(function iter (widget) {
          if (isFrame[isFrame.length - 1] && widget.component === 'Frame') {
            let label = widget.config && widget.config.label ? widget.config.label : 'without label'
            validationWarnings.push('Frame widget ' + label + ', frame not allowed in frame')
          }
          if (siblingIsFrame[siblingIsFrame.length - 1] !== undefined) {
            if ((siblingIsFrame[siblingIsFrame.length - 1] && (widget.component !== 'Frame')) || (!siblingIsFrame[siblingIsFrame.length - 1] && (widget.component === 'Frame'))) {
              let label = widget.config && widget.config.label ? widget.config.label : 'without label'
              validationWarnings.push('Widget ' + label + ', only frames or no frames at all allowed in linkable widget')
            }
          }
          siblingIsFrame.push(siblingIsFrame.pop() || widget.component === 'Frame')
          if (widget.slots && Array.isArray(widget.slots.widgets)) {
            isFrame.push(widget.component === 'Frame')
            siblingIsFrame.push(undefined)
            widget.slots.widgets.forEach(iter)
            isFrame.pop()
            siblingIsFrame.pop()
          }
        })
        widgetList.filter(widget => this.widgetTypesRequiringItem.includes(widget.component)).forEach(widget => {
          if (!(widget.config && widget.config.item)) {
            let label = widget.config && widget.config.label ? widget.config.label : 'without label'
            validationWarnings.push(widget.component + ' widget ' + label + ', no item configured')
          }
        })
        widgetList.filter(widget => widget.component === 'Video' || widget.component === 'Webview').forEach(widget => {
          if (!(widget.config && widget.config.url)) {
            let label = widget.config && widget.config.label ? widget.config.label : 'without label'
            validationWarnings.push(widget.component + ' widget ' + label + ', no url configured')
          }
        })
        widgetList.filter(widget => widget.component === 'Chart').forEach(widget => {
          if (!(widget.config && widget.config.period && ['h', '4h', '8h', '12h', 'D', '2D', '3D', 'W', '2W', 'M', '2M', '3M', 'Y'].includes(widget.config.period))) {
            let label = widget.config && widget.config.label ? widget.config.label : 'without label'
            validationWarnings.push(widget.component + ' widget ' + label + ', invalid period configured: ' + widget.config.period)
          }
        })
        widgetList.filter(widget => widget.component === 'Input').forEach(widget => {
          if (widget.config && widget.config.inputHint && !['text', 'number', 'date', 'time', 'datetime'].includes(widget.config.inputHint)) {
            let label = widget.config && widget.config.label ? widget.config.label : 'without label'
            validationWarnings.push(widget.component + ' widget ' + label + ', invalid inputHint configured: ' + widget.config.inputHint)
          }
        })
        widgetList.filter(widget => widget.component === 'Slider' || widget.component === 'Setpoint').forEach(widget => {
          if (widget.config && (widget.config.step !== undefined) && (widget.config.step <= 0)) {
            let label = widget.config && widget.config.label ? widget.config.label : 'without label'
            validationWarnings.push(widget.component + ' widget ' + label + ', step size cannot be 0 or negative: ' + widget.config.step)
          }
          if (widget.config && (widget.config.minValue !== undefined) && (widget.config.maxValue !== undefined) && (widget.config.minValue > widget.config.maxValue)) {
            let label = widget.config && widget.config.label ? widget.config.label : 'without label'
            validationWarnings.push(widget.component + ' widget ' + label + ', minValue must be less than or equal maxValue: ' + widget.config.minValue + ' > ' + widget.config.maxValue)
          }
        })
        widgetList.forEach(widget => {
          if (widget.config) {
            Object.keys(widget.config).filter(attr => ['mappings', 'visibility', 'valuecolor', 'labelcolor', 'iconcolor'].includes(attr)).forEach(attr => {
              widget.config[attr].forEach(param => {
                if (((attr === 'mappings') && !(/^\s*("[^\n"]*"|[^\n"]+)\s*=\s*("[^\n"]*"|[^\n"]+)\s*$/u.test(param))) ||
                    ((attr === 'visibility') && !(/^\s*\S+\s*(==|>=|<=|!=|>|<)\s*("[^\n"]*"|[^\n"]+)\s*$/u.test(param))) ||
                    ((attr.includes('color')) && !(/^\s*(((\S+\s*)?(==|>=|<=|!=|>|<)\s*)?(("[^\n"]*"|[^\n"]+)\s*=\s*))?("#?\w+"|'#?\w+'|#?\w+)\s*$/u.test(param)))) {
                  let label = widget.config && widget.config.label ? widget.config.label : 'without label'
                  validationWarnings.push(widget.component + ' widget ' + label + ', syntax error in ' + attr + ': ' + param)
                }
              })
            })
          }
        })
        if (validationWarnings.length > 0) {
          this.$f7.dialog.create({
            title: 'Validation errors',
            text: 'Sitemap definition has validation errors:',
            content: '<ul style="max-height: 100px; overflow-y: scroll"><li>' + validationWarnings.join('</li><li>') + '</li></ul>',
            buttons: [
              { text: 'Cancel', color: 'gray', close: true },
              { text: 'Save Anyway', color: 'red', close: true, onClick: () => this.save(stay, true) }
            ],
            destroyOnClose: true
          }).open()
          return false
        }
        return true
      }
    },
    cleanConfig (widget) {
      if (widget.config) {
        for (let key in widget.config) {
          if (widget.config[key] && Array.isArray(widget.config[key])) {
            widget.config[key] = widget.config[key].filter(Boolean)
            if (['mappings', 'visibility', 'valuecolor', 'labelcolor', 'iconcolor'].includes(key)) {
              widget.config[key].forEach(this.removeQuotes)
            }
          }
          if (!widget.config[key] && widget.config[key] !== 0) {
            delete widget.config[key]
          }
        }
      }
      if (widget.slots && widget.slots.widgets) {
        widget.slots.widgets.forEach(this.cleanConfig)
      }
    },
    removeQuotes (value) {
      value = value.replace(/"|'/g, '')
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
        const detailsLink = this.$refs.detailsLink
        const visibility = window.getComputedStyle(detailsLink.$el).visibility
        if (!visibility || visibility !== 'hidden') {
          this.detailsOpened = true
        }
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
      this.detailsTab = 'widget'
    }
  }
}
</script>
