<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar :title="!ready ? '' : ((createMode ? 'Create sitemap' : 'Sitemap: ' + sitemap.config.label) + dirtyIndicator)" back-link="Back" no-hairline>
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
      <div class="padding-right text-align-right">
        <f7-checkbox style="margin-left: 5px" :checked="includeItemName" @change="toggleItemName" />
        <label @click="toggleItemName" class="advanced-label">Show item name</label>
      </div>
      <f7-link v-if="selectedWidget" class="right details-link padding-right" ref="detailsLink" @click="detailsOpened = true" icon-f7="chevron_up" />
    </f7-toolbar>
    <f7-tabs class="sitemap-editor-tabs">
      <f7-tab class="design" id="tree" @tab:show="() => this.currentTab = 'tree'" :tab-active="currentTab === 'tree'">
        <f7-block v-if="!ready" class="text-align-center">
          <f7-preloader />
          <div>Loading...</div>
        </f7-block>
        <f7-block v-else class="sitemap-tree-wrapper" :class="{ 'sheet-opened' : detailsOpened }">
          <f7-row v-if="currentTab === 'tree'">
            <!-- do not set column width as usual, instead use custom CSS because of https://github.com/openhab/openhab-webui/issues/2574 -->
            <f7-col>
              <f7-block strong class="sitemap-tree" no-gap @click.native="clearSelection">
                <f7-treeview>
                  <sitemap-treeview-item :widget="sitemap" :includeItemName="includeItemName" :itemsList="items" @selected="selectWidget" :selected="selectedWidget" />
                </f7-treeview>
              </f7-block>
            </f7-col>
            <f7-col class="details-pane">
              <f7-block v-if="selectedWidget" no-gap>
                <widget-details :widget="selectedWidget" :createMode="createMode" @duplicate="duplicateWidget" @remove="removeWidget" @movedown="moveWidgetDown" @moveup="moveWidgetUp" />
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
              <f7-block v-if="selectedWidget && selectedWidget.component === 'Buttongrid' && !hasChildren">
                <div><f7-block-title>Buttons</f7-block-title></div>
                <attribute-details :widget="selectedWidget" attribute="buttons" placeholder="command = label = icon"
                                   :fields="JSON.stringify([{row: {width: '10%', type: 'number', min: 1, placeholder: 'row'}},
                                                            {column: {width: '10%', type: 'number', min: 1, placeholder: 'col'}},
                                                            {command: {}}])" />
              </f7-block>
              <f7-block v-if="selectedWidget && selectedWidget.component === 'Switch'">
                <div><f7-block-title>Mappings</f7-block-title></div>
                <attribute-details :widget="selectedWidget" attribute="mappings" placeholder="command:releaseCommand = label = icon" />
              </f7-block>
              <f7-block v-if="selectedWidget && selectedWidget.component === 'Selection'">
                <div><f7-block-title>Mappings</f7-block-title></div>
                <attribute-details :widget="selectedWidget" attribute="mappings" placeholder="command = label = icon" />
              </f7-block>
              <f7-block v-if="selectedWidget && selectedWidget.component !== 'Sitemap'">
                <div><f7-block-title>Icon Rules</f7-block-title></div>
                <attribute-details :widget="selectedWidget" attribute="iconrules" placeholder="item_name operator value = icon" />
              </f7-block>
              <f7-block v-if="selectedWidget && selectedWidget.component !== 'Sitemap'">
                <div><f7-block-title>Label Color</f7-block-title></div>
                <attribute-details :widget="selectedWidget" attribute="labelcolor" placeholder="item_name operator value = color" />
              </f7-block>
              <f7-block v-if="selectedWidget && canShowValue">
                <div><f7-block-title>Value Color</f7-block-title></div>
                <attribute-details :widget="selectedWidget" attribute="valuecolor" placeholder="item_name operator value = color" />
              </f7-block>
              <f7-block v-if="selectedWidget && selectedWidget.component !== 'Sitemap'">
                <div><f7-block-title>Icon Color</f7-block-title></div>
                <attribute-details :widget="selectedWidget" attribute="iconcolor" placeholder="item_name operator value = color" />
              </f7-block>
              <f7-block v-if="selectedWidget && canAddChildren(selectedWidget) && selectedWidget.component !== 'Buttongrid'">
                <div><f7-block-title>Add Child Widget</f7-block-title></div>
                <f7-card>
                  <f7-card-content>
                    <f7-list>
                      <f7-list-button color="blue" :title="`Insert Widget Inside ${selectedWidget.component}`" actions-open="#widget-type-selection" />
                    </f7-list>
                  </f7-card-content>
                </f7-card>
              </f7-block>
              <f7-block v-if="selectedWidget && canAddChildren(selectedWidget) && selectedWidget.component === 'Buttongrid'">
                <div><f7-block-title>Add Button Widget</f7-block-title></div>
                <f7-card>
                  <f7-card-content>
                    <f7-list>
                      <f7-list-button color="blue" @click="addWidget('Button')">
                        Insert Button Widget Inside Buttongrid
                      </f7-list-button>
                    </f7-list>
                  </f7-card-content>
                </f7-card>
              </f7-block>
            </f7-col>
          </f7-row>
        </f7-block>

        <f7-actions ref="widgetTypeSelection" id="widget-type-selection" :grid="true">
          <f7-actions-group>
            <f7-actions-button class="widget-button" v-for="widgetType in addableWidgetTypes" :key="widgetType.type" @click="addWidget(widgetType.type)">
              <f7-icon :f7="widgetTypeIcon(widgetType.type)" slot="media" />
              <span>{{ widgetTypeLabel(widgetType.type) }}</span>
            </f7-actions-button>
          </f7-actions-group>
        </f7-actions>
      </f7-tab>
      <f7-tab id="code" @tab:show="() => { this.currentTab = 'code' }" :tab-active="currentTab === 'code'">
        <sitemap-code v-if="currentTab === 'code'" :sitemap="sitemap" @updated="(value) => update(value)" />
      </f7-tab>
    </f7-tabs>

    <f7-fab class="add-to-sitemap-fab" v-if="canAddChildren(selectedWidget) && selectedWidget.component !== 'Buttongrid'" position="right-center" slot="fixed" color="blue" @click="$refs.widgetTypeSelection.open()">
      <f7-icon ios="f7:plus" md="material:add" aurora="f7:plus" />
      <f7-icon ios="f7:multiply" md="material:close" aurora="f7:multiply" />
    </f7-fab>
    <f7-fab class="add-to-sitemap-fab" v-if="canAddChildren(selectedWidget) && selectedWidget.component === 'Buttongrid'" position="right-center" slot="fixed" color="blue" @click="addWidget('Button')">
      <f7-icon ios="f7:plus" md="material:add" aurora="f7:plus" />
      <f7-icon ios="f7:multiply" md="material:close" aurora="f7:multiply" />
    </f7-fab>
    <f7-sheet v-if="currentTab === 'tree'" ref="detailsSheet" class="sitemap-details-sheet" :backdrop="false" :close-on-escape="true" :opened="detailsOpened" @sheet:closed="detailsOpened = false">
      <f7-page>
        <f7-toolbar tabbar bottom scrollable>
          <div class="left">
            <f7-link sheet-close class="padding-right">
              <f7-icon f7="chevron_down" />
            </f7-link>
          </div>
          <f7-link class="padding-left padding-right" :tab-link-active="detailsTab === 'widget'" @click="detailsTab = 'widget'">
            Widget
          </f7-link>
          <f7-link class="padding-left padding-right" :tab-link-active="detailsTab === 'visibility'" @click="detailsTab = 'visibility'" v-if="selectedWidget && selectedWidget.component !== 'Sitemap'">
            Visibility
          </f7-link>
          <f7-link class="padding-left padding-right" :tab-link-active="detailsTab === 'buttons'" @click="detailsTab = 'buttons'"
                   v-if="selectedWidget && selectedWidget.component === 'Buttongrid' && !hasChildren">
            Buttons
          </f7-link>
          <f7-link class="padding-left padding-right" :tab-link-active="detailsTab === 'mappings'" @click="detailsTab = 'mappings'" v-if="selectedWidget && ['Switch', 'Selection'].includes(selectedWidget.component) >= 0">
            Mappings
          </f7-link>
          <f7-link class="padding-left padding-right" :tab-link-active="detailsTab === 'icons'" @click="detailsTab = 'icons'" v-if="selectedWidget && selectedWidget.component !== 'Sitemap'">
            Icons
          </f7-link>
          <f7-link class="padding-left padding-right" :tab-link-active="detailsTab === 'colors'" @click="detailsTab = 'colors'" v-if="selectedWidget && selectedWidget.component !== 'Sitemap'">
            Colors
          </f7-link>
        </f7-toolbar>
        <f7-block style="margin-bottom: 6rem" v-if="selectedWidget && detailsTab === 'widget'">
          <widget-details :widget="selectedWidget" :createMode="createMode" @duplicate="duplicateWidget" @remove="removeWidget" @movedown="moveWidgetDown" @moveup="moveWidgetUp" />
        </f7-block>
        <f7-block style="margin-bottom: 6rem" v-if="selectedWidget && detailsTab === 'visibility'">
          <attribute-details :widget="selectedWidget" attribute="visibility" placeholder="item_name operator value" />
        </f7-block>
        <f7-block style="margin-bottom: 6rem" v-if="selectedWidget && detailsTab === 'buttons'">
          <attribute-details :widget="selectedWidget" attribute="buttons" placeholder="command = label = icon"
                             :fields="JSON.stringify([{row: {width: '10%', type: 'number', min: 1, placeholder: 'row'}},
                                                      {column: {width: '10%', type: 'number', min: 1, placeholder: 'col'}},
                                                      {command: {}}])" />
        </f7-block>
        <f7-block style="margin-bottom: 6rem" v-if="selectedWidget && detailsTab === 'mappings'">
          <attribute-details :widget="selectedWidget" attribute="mappings"
                             :placeholder="selectedWidget.component === 'Switch' ? 'cmd:releaseCmd = label = icon' : 'command = label = icon'" />
        </f7-block>
        <f7-block style="margin-bottom: 6rem" v-if="selectedWidget && detailsTab === 'icons'">
          <attribute-details :widget="selectedWidget" attribute="iconrules" placeholder="item_name operator value = icon" />
        </f7-block>
        <f7-block style="margin-bottom: 6rem" v-if="selectedWidget && detailsTab === 'colors'">
          <div><f7-block-title>Label Color</f7-block-title></div>
          <attribute-details :widget="selectedWidget" attribute="labelcolor" placeholder="item_name operator value = color" />
          <div v-if="canShowValue">
            <f7-block-title>Value Color</f7-block-title>
          </div>
          <attribute-details v-if="canShowValue" :widget="selectedWidget" attribute="valuecolor" placeholder="item_name operator value = color" />
          <div><f7-block-title>Icon Color</f7-block-title></div>
          <attribute-details :widget="selectedWidget" attribute="iconcolor" placeholder="item_name operator value = color" />
        </f7-block>
      </f7-page>
    </f7-sheet>
  </f7-page>
</template>

<style lang="stylus">
.sitemap-editor-tabs
  height 100%
  overflow hidden
  .tab
    height 100%
  .design
    --f7-grid-gap 0px
    overflow auto

.sitemap-tree-wrapper
  padding 0
  margin-bottom 0
  height calc(100% - var(--f7-toolbar-height))
  .col
    width 100% /* manually set column width because of https://github.com/openhab/openhab-webui/issues/2574 */
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
.widget-button
  padding-bottom 8px !important
  .actions-button-text
    height 2lh
  .actions-button-text span
    display -webkit-box
    -webkit-box-orient vertical
    overflow hidden
    text-overflow ellipsis
    -webkit-line-clamp 2
    white-space normal
    max-height 2lh
    line-height 1lh

@media (min-width: 768px)
  .sitemap-tree-wrapper
    .row
      height 100%
      .col
        width 50% /* manually set column width because of https://github.com/openhab/openhab-webui/issues/2574 */
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
  .sitemap-details-sheet
    visibility hidden !important
  .toolbar-details
    .details-link
      visibility hidden !important
  .add-to-sitemap-fab
    visibility hidden !important

@media (max-width: 767px)
  .details-pane
    display none
  .sitemap-tree-wrapper
    margin-top 0 !important
  .sitemap-tree-wrapper.sheet-opened
    margin-bottom calc(var(--f7-sheet-height) - var(--f7-toolbar-height))
    height auto
  .details-sheet
    height calc(1.4*var(--f7-sheet-height))
</style>

<script>
import cloneDeep from 'lodash/cloneDeep'

import SitemapCode from '@/components/pagedesigner/sitemap/sitemap-code.vue'
import WidgetDetails from '@/components/pagedesigner/sitemap/widget-details.vue'
import AttributeDetails from '@/components/pagedesigner/sitemap/attribute-details.vue'
import SitemapTreeviewItem from '@/components/pagedesigner/sitemap/treeview-item.vue'
import SitemapMixin from '@/components/pagedesigner/sitemap/sitemap-mixin'
import DirtyMixin from '@/pages/settings/dirty-mixin'
import fastDeepEqual from 'fast-deep-equal/es6'

export default {
  mixins: [DirtyMixin, SitemapMixin],
  components: {
    SitemapCode,
    WidgetDetails,
    AttributeDetails,
    SitemapTreeviewItem
  },
  props: ['createMode', 'uid', 'itemsList'],
  data () {
    if (!this.$f7.data.sitemap) this.$f7.data.sitemap = {}
    return {
      includeItemName: this.$f7.data.sitemap.includeItemName || false,
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
      lastCleanSitemap: null,
      selectedWidget: null,
      selectedWidgetParent: null,
      previousSelection: null,
      detailsOpened: false,
      detailsTab: 'widget',
      currentTab: 'tree',
      eventSource: null
    }
  },
  computed: {
    hasChildren () {
      if (!this.selectedWidget) return false
      return (Array.isArray(this.selectedWidget.slots?.widgets) && this.selectedWidget.slots.widgets.length)
    },
    canShowValue () {
      if (!this.selectedWidget) return false
      return this.WIDGET_TYPES_SHOWING_VALUE.includes(this.selectedWidget.component)
    },
    addableWidgetTypes () {
      if (!this.selectedWidget) return
      return this.allowedWidgetTypes(this.selectedWidget)
    }
  },
  watch: {
    sitemap: {
      handler (newVal) {
        if (this.loading) return
        if (!fastDeepEqual(this.stripClosed(newVal), this.lastCleanSitemap)) {
          this.dirty = true
        } else {
          this.dirty = false
        }
      },
      deep: true
    },
    currentTab (newTab, oldTab) {
      if (oldTab === 'tree' && this.$refs.detailsSheet) {
        this.$refs.detailsSheet.close()
      }
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
    stripClosed (obj) {
      // Remove the closed field as it is only used for expanding the tree, and should not impact the dirty state
      if (Array.isArray(obj)) {
        return obj.map(this.stripClosed)
      } else if (obj !== null && typeof obj === 'object') {
        // also exclude parent to avoid recursive copies
        const { parent, closed, ...rest } = obj
        const result = {}
        for (const key in rest) {
          result[key] = this.stripClosed(rest[key])
        }
        return result
      } else {
        return obj
      }
    },
    setParents (widget) {
      // keep parents with widget for drag and drop
      widget.slots?.widgets?.forEach((w) => {
        this.$set(w, 'parent', widget)
        this.setParents(w)
      })
    },
    load () {
      if (this.loading) return
      this.loading = true

      if (this.ready && this.dirty) this.save(true, true)

      if (this.createMode) {
        this.$set(this, 'lastCleanSitemap', this.stripClosed(this.sitemap))
        this.loading = false
        this.ready = true
      } else {
        this.$oh.api.get('/rest/ui/components/system:sitemap/' + this.uid).then((data) => {
          const sitemap = this.preProcessSitemapLoad(data)
          this.$set(this, 'sitemap', sitemap)
          this.$nextTick(() => {
            this.$set(this, 'lastCleanSitemap', this.stripClosed(this.sitemap))
            this.setParents(this.sitemap)
            this.ready = true
            this.loading = false
          })
        })
      }
    },
    toggleItemName () {
      this.includeItemName = !this.includeItemName
      this.$f7.data.sitemap.includeItemName = this.includeItemName
      this.load()
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

      const sitemap = this.preProcessSitemapSave(this.sitemap)

      const promise = (this.createMode)
        ? this.$oh.api.postPlain('/rest/ui/components/system:sitemap', JSON.stringify(sitemap), 'text/plain', 'application/json')
        : this.$oh.api.put('/rest/ui/components/system:sitemap/' + sitemap.uid, sitemap)
      promise.then((data) => {
        this.dirty = false
        if (this.createMode) {
          this.$f7.toast.create({
            text: 'Sitemap created',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
          this.load()
          this.$f7router.navigate(this.$f7route.url.replace('/add', '/' + sitemap.uid), { reloadCurrent: true })
        } else {
          this.$f7.toast.create({
            text: 'Sitemap updated',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
          this.$set(this, 'lastCleanSitemap', this.stripClosed(this.sitemap))
          this.setParents(sitemap)
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
      let scope = this
      if (Array.isArray(this.sitemap.slots?.widgets) && this.sitemap.slots.widgets.length) {
        let validationWarnings = []
        const widgetList = this.sitemap.slots.widgets.reduce(function iter (widgets, widget) {
          widgets.push(widget)
          if (Array.isArray(widget.slots?.widgets)) {
            return widget.slots.widgets.reduce(iter, widgets)
          }
          return widgets
        }, [])
        let isFrame = [false]
        let siblingIsFrame = [undefined]
        this.sitemap.slots.widgets.forEach(function iter (widget) {
          let label = scope.widgetErrorLabel(widget.config)
          if (isFrame[isFrame.length - 1] && widget.component === 'Frame') {
            validationWarnings.push('Frame widget ' + label + ', frame not allowed in frame')
          }
          if (siblingIsFrame[siblingIsFrame.length - 1] !== undefined) {
            if ((siblingIsFrame[siblingIsFrame.length - 1] && (widget.component !== 'Frame')) || (!siblingIsFrame[siblingIsFrame.length - 1] && (widget.component === 'Frame'))) {
              validationWarnings.push('Widget ' + label + ', only frames or no frames at all allowed in linkable widget')
            }
          }
          siblingIsFrame.push(siblingIsFrame.pop() || widget.component === 'Frame')
          if (Array.isArray(widget.slots?.widgets)) {
            isFrame.push(widget.component === 'Frame')
            siblingIsFrame.push(undefined)
            widget.slots.widgets.forEach(iter)
            isFrame.pop()
            siblingIsFrame.pop()
          }
        })
        widgetList.filter(widget => widget.component === 'Frame').forEach(widget => {
          if (!widget.slots?.widgets || !widget.slots.widgets.length) {
            let label = scope.widgetErrorLabel(widget.config)
            validationWarnings.push(widget.component + ' widget ' + label + ' should not be empty')
          }
        })
        widgetList.filter(widget => this.WIDGET_TYPES_REQUIRING_ITEM.includes(widget.component)).forEach(widget => {
          if (!widget.config?.item) {
            let label = scope.widgetErrorLabel(widget.config)
            validationWarnings.push(widget.component + ' widget ' + label + ', no item configured')
          }
        })
        widgetList.filter(widget => widget.component === 'Video' || widget.component === 'Webview').forEach(widget => {
          if (!widget.config?.url) {
            let label = scope.widgetErrorLabel(widget.config)
            validationWarnings.push(widget.component + ' widget ' + label + ', no url configured')
          }
        })
        widgetList.filter(widget => widget.component === 'Chart').forEach(widget => {
          if (!(widget.config?.period && this.REGEX_PERIOD.test(widget.config.period))) {
            let label = scope.widgetErrorLabel(widget.config)
            validationWarnings.push(widget.component + ' widget ' + label + ', invalid period configured: ' + widget.config?.period)
          }
          if (widget.config?.yAxisDecimalPattern && !this.REGEX_DECIMAL_PATTERN.test(widget.config.yAxisDecimalPattern)) {
            let label = scope.widgetErrorLabel(widget.config)
            validationWarnings.push(widget.component + ' widget ' + label + ', invalid Y-axis decimal pattern configured: ' + widget.config?.yAxisDecimalPattern)
          }
        })
        widgetList.filter(widget => widget.component === 'Input').forEach(widget => {
          if (widget.config?.inputHint && !['text', 'number', 'date', 'time', 'datetime'].includes(widget.config.inputHint)) {
            let label = scope.widgetErrorLabel(widget.config)
            validationWarnings.push(widget.component + ' widget ' + label + ', invalid inputHint configured: ' + widget.config?.inputHint)
          }
        })
        widgetList.filter(widget => ['Slider', 'Setpoint', 'Colortemperaturepicker'].includes(widget.component)).forEach(widget => {
          let label = scope.widgetErrorLabel(widget.config)
          if (widget.config?.step <= 0) {
            validationWarnings.push(widget.component + ' widget ' + label + ', step size cannot be 0 or negative: ' + widget.config.step)
          }
          if (widget.config?.minValue > widget.config?.maxValue) {
            validationWarnings.push(widget.component + ' widget ' + label + ', minValue must be less than or equal maxValue: ' + widget.config.minValue + ' > ' + widget.config.maxValue)
          }
        })
        widgetList.filter(widget => widget.component === 'Buttongrid').forEach(widget => {
          let label = scope.widgetErrorLabel(widget.config)
          if (!widget.config?.item && !widget.slots?.widgets?.length) {
            validationWarnings.push(widget.component + ' widget ' + label + ', no item configured')
          }
          if (!(widget.config?.buttons?.length || widget.slots?.widgets?.length)) {
            validationWarnings.push(widget.component + ' widget ' + label + ', no buttons defined')
          }
          let positions = []
          if (widget.config?.buttons?.length) {
            positions = widget.config.buttons.map(param => { return { row: param.row, column: param.column } })
          } else if (widget.slots?.widgets?.length) {
            positions = widget.slots.widgets.filter(widget => widget.config).map(widget => { return { row: widget.config.row, column: widget.config.column } })
          }
          let occurrences = {}
          const duplicates = positions.filter(pos => {
            const jsonpos = JSON.stringify(pos)
            if (occurrences[jsonpos]) return true
            occurrences[jsonpos] = true
            return false
          })
          duplicates.forEach(duplicate =>
            validationWarnings.push(widget.component + ' widget ' + label + ', duplicate button position : row ' + duplicate.row + ' column ' + duplicate.column)
          )
        })
        widgetList.filter(widget => widget.component === 'Button').forEach(widget => {
          let label = scope.widgetErrorLabel(widget.config)
          let parentWidget = widgetList.find(w => {
            if (w.slots?.widgets?.includes(widget)) return w
            return undefined
          })
          if (!(parentWidget?.component === 'Buttongrid')) {
            validationWarnings.push(widget.component + ' widget ' + label + ', can only be defined inside a Buttongrid component')
          }
          if (!(widget.config?.item)) {
            // if there is an item configured on the Buttongrid level, we will use that when saving
            if (!((parentWidget?.component === 'Buttongrid') && parentWidget?.config?.item)) {
              validationWarnings.push(widget.component + ' widget ' + label + ', no item configured')
            }
          }
          if (!(widget.config?.row) || isNaN(widget.config?.row) || (widget.config?.row <= 0) || (widget.config?.row > 12)) {
            validationWarnings.push(widget.component + ' widget ' + label + ', invalid row configured: ' + widget.config.row)
          }
          if (!(widget.config?.column) || isNaN(widget.config?.column) || (widget.config?.column <= 0)) {
            validationWarnings.push(widget.component + ' widget ' + label + ', invalid column configured: ' + widget.config.column)
          }
          if (!(widget.config?.cmd)) {
            validationWarnings.push(widget.component + ' widget ' + label + ', no click command defined')
          }
        })
        widgetList.forEach(widget => {
          if (widget.config) {
            let label = scope.widgetErrorLabel(widget.config)
            Object.keys(widget.config).filter(attr => ['buttons', 'mappings', 'visibility', 'valuecolor', 'labelcolor', 'iconcolor', 'iconrules'].includes(attr)).forEach(attr => {
              widget.config[attr].forEach(param => {
                if (((attr === 'mappings') && !this.validateMapping(widget.component, param)) ||
                    ((['visibility', 'valuecolor', 'labelcolor', 'iconcolor', 'iconrules'].includes(attr)) && !this.validateRule(attr, param))) {
                  validationWarnings.push(widget.component + ' widget ' + label + ', syntax error in ' + attr + ': ' + param)
                }
                if (attr === 'buttons') {
                  if (!param.row || isNaN(param.row) || (param.row <= 0) || (param.row > 12)) {
                    validationWarnings.push(widget.component + ' widget ' + label + ', invalid row configured: ' + param.row)
                  }
                  if (!param.column || isNaN(param.column) || (param.column <= 0)) {
                    validationWarnings.push(widget.component + ' widget ' + label + ', invalid column configured: ' + param.column)
                  }
                  if (!this.validateMapping(widget.component, param.command)) {
                    validationWarnings.push(widget.component + ' widget ' + label + ', syntax error in button command: ' + param.command)
                  }
                }
              })
            })
          }
        })
        if (validationWarnings.length > 0) {
          this.$f7.dialog.create({
            cssClass: 'sitemap-validation-dialog',
            title: 'Validation errors',
            text: 'Sitemap definition has validation errors:',
            content: '<ul style="max-height: 200px; overflow-y: scroll"><li>' + validationWarnings.join('</li><li>') + '</li></ul>',
            buttons: [
              { text: 'Cancel', color: 'gray', close: true },
              { text: 'Save Anyway', color: 'red', close: true, onClick: () => this.save(stay, true) }
            ],
            destroyOnClose: true
          }).open()
          return false
        }
      }
      return true
    },
    widgetErrorLabel (config) {
      return config?.label ?? (config?.item ? 'for item ' + config.item : 'without label')
    },
    validateMapping (component, mapping) {
      if (component === 'Switch') {
        // for Switch widget, also check for releaseCommand
        return this.REGEX_MAPPING_SWITCH.test(mapping)
      }
      return this.REGEX_MAPPING.test(mapping)
    },
    validateRule (attr, rule) {
      if (attr === 'visibility') {
        return this.REGEX_RULE_VISIBILITY.test(rule)
      }
      return this.REGEX_RULE.test(rule)
    },
    cleanConfig (widget) {
      if (widget.config) {
        for (let key in widget.config) {
          if (widget.config[key] && Array.isArray(widget.config[key])) {
            widget.config[key] = widget.config[key].filter(Boolean)
            if (key === 'buttons') {
              widget.config[key].sort((value1, value2) => (value1.row - value2.row) || (value1.column - value2.column))
            }
          }
          if (!widget.config[key] && widget.config[key] !== 0) {
            delete widget.config[key]
          }
        }
      }
      if (widget.component === 'Buttongrid') {
        widget.slots?.widgets?.sort((button1, button2) => ((button1.config?.row ?? 0) - (button2.config?.row ?? 0)) || ((button1.config?.column ?? 0) - (button2.config?.column ?? 0)))
      }
      this.addEmptySlot(widget)
      widget.slots?.widgets?.forEach(this.cleanConfig)
    },
    preProcessSitemapLoad (sitemap) {
      const processed = JSON.parse(JSON.stringify(sitemap))
      if (processed.slots && processed.slots.widgets) {
        processed.slots.widgets.forEach(this.preProcessWidgetLoad)
      }
      return processed
    },
    preProcessWidgetLoad (widget) {
      if (widget.config) {
        for (let key in widget.config) {
          if (widget.config[key] && Array.isArray(widget.config[key])) {
            if (key === 'buttons') {
              widget.config[key].forEach((value, index) => {
                const vArray = value.split(':')
                const row = vArray[0]
                const column = vArray[1]
                const command = vArray.slice(2).join(':')
                widget.config[key][index] = { row, column, command }
              })
            }
          }
        }
      }
      this.addEmptySlot(widget)
      widget.slots?.widgets?.forEach(this.preProcessWidgetLoad)
    },
    addEmptySlot (widget) {
      // Needed for drag and drop to work into empty slot
      if (this.LINKABLE_WIDGET_TYPES.includes(widget.component)) {
        if (!widget.slots) {
          widget.slots = {}
        }
        if (!widget.slots.widgets) {
          widget.slots.widgets = []
        }
      }
    },
    preProcessSitemapSave (sitemap) {
      const processed = JSON.parse(JSON.stringify(sitemap))
      processed.slots?.widgets?.forEach(this.preProcessWidgetSave)
      return processed
    },
    preProcessWidgetSave (widget) {
      if (widget.config) {
        for (let key in widget.config) {
          if (widget.config[key] && Array.isArray(widget.config[key])) {
            if (key === 'buttons') {
              widget.config[key].forEach((value, index) => { widget.config[key][index] = value.row + ':' + value.column + ':' + value.command })
            }
          }
        }
      }
      if ((widget.component === 'Buttongrid') && widget.config?.item) {
        if (!widget.config.buttons && widget.slots?.widgets) {
          widget.slots.widgets.forEach(w => {
            if (!w.config) w.config = {}
            if (!w.config.item) w.config.item = widget.config.item
          })
          delete widget.config.item
        }
      }
      widget.slots?.widgets?.forEach(this.preProcessWidgetSave)
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
    duplicateWidget () {
      const duplicate = cloneDeep(this.selectedWidget)
      const index = this.selectedWidgetParent.slots.widgets.indexOf(this.selectedWidget) + 1
      this.selectedWidgetParent.slots.widgets.splice(index, 0, duplicate)
      this.$set(this, 'selectedWidget', this.selectedWidgetParent.slots.widgets[index])
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
        this.detailsTab = 'widget'
        this.$nextTick(() => {
          const detailsLink = this.$refs.detailsLink
          const visibility = window.getComputedStyle(detailsLink.$el).visibility
          if (!visibility || visibility !== 'hidden') {
            this.detailsOpened = true
          }
        })
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
