<template>
  <f7-page ref="sitemap-edit-page" @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar no-hairline>
      <oh-nav-content
        :title="!ready ? '' : (createMode ? 'Create sitemap' : sitemap.label) + dirtyIndicator"
        :save-link="editable ? `Save${$device.desktop ? ' (Ctrl-S)' : ''}` : null"
        @save="save()"
        :f7router>
        <template #right>
          <f7-link v-if="!editable" icon-f7="lock_fill" tooltip="This Sitemap is not editable through the UI" />
        </template>
      </oh-nav-content>
    </f7-navbar>
    <f7-toolbar tabbar position="top">
      <f7-link @click="currentTab = 'tree'" :tab-link-active="currentTab === 'tree'"> Design </f7-link>
      <f7-link @click="currentTab = 'code'" :tab-link-active="currentTab === 'code'"> Code </f7-link>
    </f7-toolbar>
    <f7-toolbar v-if="currentTab === 'tree'" bottom class="toolbar-details">
      <f7-link class="left" :class="{ disabled: selectedWidget == null }" @click="selectedWidget = null"> Clear </f7-link>
      <div class="padding-right text-align-right">
        <label class="advanced-label">
          <f7-checkbox style="margin-left: 5px; padding-right: 5px" v-model:checked="sitemapIncludeItemName" />
          Show item name
        </label>
      </div>
      <div>
        <f7-link
          v-if="selectedWidget"
          class="right details-link padding-right"
          ref="detailsLink"
          @click="detailsOpened = true"
          icon-f7="chevron_up" />
      </div>
    </f7-toolbar>
    <f7-tabs class="sitemap-editor-tabs">
      <f7-tab class="design" id="tree" :tab-active="currentTab === 'tree'">
        <f7-block v-if="!ready" class="text-align-center">
          <f7-preloader />
          <div>Loading...</div>
        </f7-block>
        <f7-block v-else class="sitemap-tree-wrapper" :class="{ 'sheet-opened': detailsOpened }">
          <f7-row v-if="currentTab === 'tree'">
            <!-- do not set column width as usual, instead use custom CSS because of https://github.com/openhab/openhab-webui/issues/2574 -->
            <f7-col>
              <f7-block strong class="sitemap-tree" no-gap @click="clearSelection">
                <f7-treeview>
                  <sitemap-treeview-item
                    :widget="sitemap"
                    :includeItemName="sitemapIncludeItemName"
                    :itemsList="items"
                    @selected="selectWidget"
                    :selected="selectedWidget"
                    :editable="editable" />
                </f7-treeview>
              </f7-block>
            </f7-col>
            <f7-col class="details-pane">
              <f7-block v-if="selectedWidget" no-gap>
                <widget-details
                  :widget="selectedWidget"
                  :createMode="createMode"
                  :editable="editable"
                  @duplicate="duplicateWidget"
                  @remove="removeWidget"
                  @movedown="moveWidgetDown"
                  @moveup="moveWidgetUp" />
              </f7-block>
              <f7-block v-else>
                <div class="padding text-align-center">Nothing selected</div>
              </f7-block>
              <f7-block v-if="selectedWidget && selectedWidget.type !== 'Sitemap' && (editable || selectedWidget.visibilityRules?.length)">
                <div><f7-block-title>Visibility</f7-block-title></div>
                <attribute-details
                  :widget="selectedWidget"
                  attribute="visibilityRules"
                  :fields="visibilityRulesFields"
                  :disabled="!editable" />
              </f7-block>
              <f7-block v-if="selectedWidget && selectedWidget.type === 'Buttongrid'">
                <div><f7-block-title>Buttons</f7-block-title></div>
                <attribute-details :widget="selectedWidget" attribute="buttons" :fields="buttonFields" :disabled="!editable" />
              </f7-block>
              <f7-block
                v-if="
                  selectedWidget && ['Switch', 'Selection'].includes(selectedWidget.type) && (editable || selectedWidget.mappings?.length)
                ">
                <div><f7-block-title>Mappings</f7-block-title></div>
                <attribute-details
                  :widget="selectedWidget"
                  attribute="mappings"
                  :fields="selectedWidget.type === 'Switch' ? switchMappingFields : selectionMappingFields"
                  :disabled="!editable" />
              </f7-block>
              <f7-block v-if="selectedWidget && selectedWidget.type !== 'Sitemap' && (editable || selectedWidget.iconRules?.length)">
                <div><f7-block-title>Icon Rules</f7-block-title></div>
                <attribute-details :widget="selectedWidget" attribute="iconRules" :fields="iconRulesFields" :disabled="!editable" />
              </f7-block>
              <f7-block v-if="selectedWidget && selectedWidget.type !== 'Sitemap' && (editable || selectedWidget.labelColorRules?.length)">
                <div><f7-block-title>Label Color</f7-block-title></div>
                <attribute-details :widget="selectedWidget" attribute="labelColorRules" :fields="colorRulesFields" :disabled="!editable" />
              </f7-block>
              <f7-block v-if="selectedWidget && canShowValue && (editable || selectedWidget.valueColorRules?.length)">
                <div><f7-block-title>Value Color</f7-block-title></div>
                <attribute-details :widget="selectedWidget" attribute="valueColorRules" :fields="colorRulesFields" :disabled="!editable" />
              </f7-block>
              <f7-block v-if="selectedWidget && selectedWidget.type !== 'Sitemap' && (editable || selectedWidget.iconColorRules?.length)">
                <div><f7-block-title>Icon Color</f7-block-title></div>
                <attribute-details :widget="selectedWidget" attribute="iconColorRules" :fields="colorRulesFields" :disabled="!editable" />
              </f7-block>
              <f7-block v-if="editable && selectedWidget && canAddChildren(selectedWidget) && selectedWidget.type !== 'Buttongrid'">
                <div><f7-block-title>Add Child Widget</f7-block-title></div>
                <f7-card>
                  <f7-card-content>
                    <f7-list>
                      <f7-list-button
                        color="blue"
                        :title="`Insert Widget Inside ${selectedWidget.type}`"
                        actions-open="#widget-type-selection" />
                    </f7-list>
                  </f7-card-content>
                </f7-card>
              </f7-block>
              <f7-block v-if="editable && selectedWidget && canAddChildren(selectedWidget) && selectedWidget.type === 'Buttongrid'">
                <div><f7-block-title>Add Button Widget</f7-block-title></div>
                <f7-card>
                  <f7-card-content>
                    <f7-list>
                      <f7-list-button color="blue" @click="addWidget('Button')"> Insert Button Widget Inside Buttongrid </f7-list-button>
                    </f7-list>
                  </f7-card-content>
                </f7-card>
              </f7-block>
            </f7-col>
          </f7-row>
        </f7-block>

        <f7-actions ref="widgetTypeSelection" id="widget-type-selection" :grid="true">
          <f7-actions-group>
            <f7-actions-button
              v-for="widgetType in addableWidgetTypes"
              class="widget-button"
              :key="widgetType.type"
              @click="addWidget(widgetType.type)">
              <template #media>
                <f7-icon :f7="widgetTypeIcon(widgetType.type)" />
              </template>
              <span>{{ widgetTypeLabel(widgetType.type) }}</span>
            </f7-actions-button>
          </f7-actions-group>
        </f7-actions>
      </f7-tab>
      <f7-tab id="code" :tab-active="currentTab === 'code'">
        <sitemap-code v-if="currentTab === 'code'" :sitemap="sitemap" @updated="(value) => update(value)" />
      </f7-tab>
    </f7-tabs>

    <template #fixed>
      <f7-fab
        v-if="canAddChildren(selectedWidget) && selectedWidget.type !== 'Buttongrid'"
        class="add-to-sitemap-fab"
        position="right-center"
        color="blue"
        @click="$refs.widgetTypeSelection.open()">
        <f7-icon ios="f7:plus" md="material:add" aurora="f7:plus" />
        <f7-icon ios="f7:multiply" md="material:close" aurora="f7:multiply" />
      </f7-fab>
      <f7-fab
        v-if="canAddChildren(selectedWidget) && selectedWidget.type === 'Buttongrid'"
        class="add-to-sitemap-fab"
        position="right-center"
        color="blue"
        @click="addWidget('Button')">
        <f7-icon ios="f7:plus" md="material:add" aurora="f7:plus" />
        <f7-icon ios="f7:multiply" md="material:close" aurora="f7:multiply" />
      </f7-fab>
    </template>

    <f7-sheet
      v-if="currentTab === 'tree'"
      ref="detailsSheet"
      class="sitemap-details-sheet"
      :backdrop="false"
      :close-on-escape="true"
      :opened="detailsOpened"
      @sheet:closed="detailsOpened = false">
      <f7-page>
        <f7-toolbar tabbar bottom scrollable @wheel="onDetailsToolbarWheel">
          <div class="left">
            <f7-link sheet-close class="padding-right">
              <f7-icon f7="chevron_down" />
            </f7-link>
          </div>
          <f7-link class="padding-left padding-right" :tab-link-active="detailsTab === 'widget'" @click="detailsTab = 'widget'">
            Widget
          </f7-link>
          <f7-link
            v-if="selectedWidget && selectedWidget.type !== 'Sitemap' && (editable || selectedWidget.visibilityRules?.length)"
            class="padding-left padding-right"
            :tab-link-active="detailsTab === 'visibilityRules'"
            @click="detailsTab = 'visibilityRules'">
            Visibility
          </f7-link>
          <f7-link
            v-if="selectedWidget && selectedWidget.type === 'Buttongrid' && (editable || selectedWidget.buttons?.length)"
            class="padding-left padding-right"
            :tab-link-active="detailsTab === 'buttons'"
            @click="detailsTab = 'buttons'">
            Buttons
          </f7-link>
          <f7-link
            v-if="selectedWidget && ['Switch', 'Selection'].includes(selectedWidget.type) && (editable || selectedWidget.mappings?.length)"
            class="padding-left padding-right"
            :tab-link-active="detailsTab === 'mappings'"
            @click="detailsTab = 'mappings'">
            Mappings
          </f7-link>
          <f7-link
            v-if="selectedWidget && selectedWidget.type !== 'Sitemap' && (editable || selectedWidget.iconRules?.length)"
            class="padding-left padding-right"
            :tab-link-active="detailsTab === 'icons'"
            @click="detailsTab = 'icons'">
            Icons
          </f7-link>
          <f7-link
            v-if="
              selectedWidget &&
              selectedWidget.type !== 'Sitemap' &&
              (editable ||
                selectedWidget.labelColorRules?.length ||
                selectedWidget.valueColorRules?.length ||
                selectedWidget.iconColorRules?.length)
            "
            class="padding-left padding-right"
            :tab-link-active="detailsTab === 'colors'"
            @click="detailsTab = 'colors'">
            Colors
          </f7-link>
        </f7-toolbar>
        <f7-block v-if="selectedWidget && detailsTab === 'widget'" style="margin-bottom: 6rem">
          <widget-details
            :widget="selectedWidget"
            :createMode="createMode"
            :editable="editable"
            @duplicate="duplicateWidget"
            @remove="removeWidget"
            @movedown="moveWidgetDown"
            @moveup="moveWidgetUp" />
        </f7-block>
        <f7-block v-if="selectedWidget && detailsTab === 'visibilityRules'" style="margin-bottom: 6rem">
          <attribute-details :widget="selectedWidget" attribute="visibilityRules" :fields="visibilityRulesFields" :disabled="!editable" />
        </f7-block>
        <f7-block v-if="selectedWidget && detailsTab === 'buttons'" style="margin-bottom: 6rem">
          <attribute-details :widget="selectedWidget" attribute="buttons" :fields="buttonFields" :disabled="!editable" />
        </f7-block>
        <f7-block v-if="selectedWidget && detailsTab === 'mappings'" style="margin-bottom: 6rem">
          <attribute-details
            :widget="selectedWidget"
            attribute="mappings"
            :fields="selectedWidget.type === 'Switch' ? switchMappingFields : selectionMappingFields"
            :disabled="!editable" />
        </f7-block>
        <f7-block v-if="selectedWidget && detailsTab === 'icons'" style="margin-bottom: 6rem">
          <attribute-details :widget="selectedWidget" attribute="iconRules" :fields="iconRulesFields" :disabled="!editable" />
        </f7-block>
        <f7-block v-if="selectedWidget && detailsTab === 'colors'" style="margin-bottom: 6rem">
          <div v-if="editable || selectedWidget.labelColorRules?.length">
            <f7-block-title>Label Color</f7-block-title>
            <attribute-details :widget="selectedWidget" attribute="labelColorRules" :fields="colorRulesFields" :disabled="!editable" />
          </div>
          <div v-if="canShowValue && (editable || selectedWidget.valueColorRules?.length)">
            <f7-block-title>Value Color</f7-block-title>
            <attribute-details :widget="selectedWidget" attribute="valueColorRules" :fields="colorRulesFields" :disabled="!editable" />
          </div>
          <div v-if="editable || selectedWidget.iconColorRules?.length">
            <f7-block-title>Icon Color</f7-block-title>
            <attribute-details :widget="selectedWidget" attribute="iconColorRules" :fields="iconRulesFields" :disabled="!editable" />
          </div>
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
    .toolbar-inner
      display flex
      overflow-x auto
      overflow-y hidden
      flex-wrap nowrap
      -webkit-overflow-scrolling touch
      scrollbar-width none
      &::-webkit-scrollbar
        display none
    &.tabbar .link
      width auto
      flex 0 0 auto
  .left
    flex-shrink 0
  z-index 10900
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
import { nextTick } from 'vue'
import { f7 } from 'framework7-vue'
import { mapWritableState } from 'pinia'

import cloneDeep from 'lodash/cloneDeep'

import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'

import SitemapCode from '@/components/pagedesigner/sitemap/sitemap-code.vue'
import WidgetDetails from '@/components/pagedesigner/sitemap/widget-details.vue'
import AttributeDetails from '@/components/pagedesigner/sitemap/attribute-details.vue'
import SitemapTreeviewItem from '@/components/pagedesigner/sitemap/treeview-item.vue'
import SitemapMixin from '@/components/pagedesigner/sitemap/sitemap-mixin'
import fastDeepEqual from 'fast-deep-equal/es6'
import { showToast } from '@/js/dialog-promises'
import { useDirty } from '@/pages/useDirty'

export default {
  mixins: [SitemapMixin],
  components: {
    SitemapCode,
    WidgetDetails,
    AttributeDetails,
    SitemapTreeviewItem
  },
  props: {
    createMode: Boolean,
    uid: String,
    itemsList: Array,
    f7router: Object,
    f7route: Object
  },
  setup() {
    const { dirty, dirtyIndicator } = useDirty('sitemap-edit-page')
    return { dirty, dirtyIndicator }
  },
  data() {
    return {
      ready: false,
      loading: false,
      sitemap: {
        name: 'page_' + f7.utils.id(),
        type: 'Sitemap',
        icon: '',
        label: 'New Sitemap',
        widgets: []
      },
      lastCleanSitemap: null,
      selectedWidget: null,
      selectedWidgetParent: null,
      previousSelection: null,
      detailsOpened: false,
      detailsTab: 'widget',
      currentTab: 'tree',
      eventSource: null,
      switchMappingFields: [
        { command: { width: '15%', placeholder: 'cmd', required: true } },
        ':',
        { releaseCommand: { width: '15%', placeholder: '[release]' } },
        '=',
        { label: { placeholder: 'label', required: true } },
        '=',
        { icon: { width: '20%', placeholder: '[icon]' } }
      ],
      selectionMappingFields: [
        { command: { width: '20%', placeholder: 'cmd', required: true } },
        '=',
        { label: { placeholder: 'label', required: true } },
        '=',
        { icon: { width: '20%', placeholder: '[icon]' } }
      ],
      buttonFields: [
        { row: { width: '10%', type: 'number', min: 1, placeholder: 'row', required: true } },
        ':',
        { column: { width: '10%', type: 'number', min: 1, max: 12, placeholder: 'col', required: true } },
        ':',
        { command: { width: '20%', placeholder: 'cmd', required: true } },
        '=',
        { label: { placeholder: '[label]' } },
        '=',
        { icon: { width: '20%', placeholder: '[icon]' } }
      ],
      visibilityRulesFields: [
        {
          conditions: [
            { item: { width: '30%', type: 'item', placeholder: '[item]' } },
            { condition: { width: '10%', type: 'operator' } },
            { value: { placeholder: 'value', required: true } }
          ]
        }
      ],
      iconRulesFields: [
        {
          conditions: [
            { item: { width: '30%', type: 'item', placeholder: '[item]' } },
            { condition: { width: '10%', type: 'operator' } },
            { value: { placeholder: 'value', required: true } }
          ]
        },
        '=',
        { argument: { width: '20%', placeholder: 'icon', required: true } }
      ],
      colorRulesFields: [
        {
          conditions: [
            { item: { width: '30%', type: 'item', placeholder: '[item]' } },
            { condition: { width: '10%', type: 'operator' } },
            { value: { placeholder: 'value', required: true } }
          ]
        },
        '=',
        { argument: { width: '20%', placeholder: 'color', required: true } }
      ]
    }
  },
  computed: {
    hasChildren() {
      if (!this.selectedWidget) return false
      return Array.isArray(this.selectedWidget.widgets) && this.selectedWidget.widgets.length
    },
    canShowValue() {
      if (!this.selectedWidget) return false
      return this.WIDGET_TYPES_SHOWING_VALUE.includes(this.selectedWidget.type)
    },
    addableWidgetTypes() {
      if (!this.selectedWidget) return []
      return this.allowedWidgetTypes(this.selectedWidget)
    },
    ...mapWritableState(useUIOptionsStore, {
      sitemapIncludeItemName: 'sitemapShowItemName'
    }),
    editable() {
      return this.sitemap.editable ?? true
    }
  },
  watch: {
    sitemap: {
      handler(newVal) {
        if (this.loading) return
        if (!fastDeepEqual(this.stripClosed(newVal), this.lastCleanSitemap)) {
          this.dirty = true
        } else {
          this.dirty = false
        }
      },
      deep: true
    },
    currentTab(newTab, oldTab) {
      if (oldTab === 'tree' && this.$refs.detailsSheet) {
        this.$refs.detailsSheet.$el.f7Modal.close()
      }
    }
  },
  methods: {
    onDetailsToolbarWheel(ev) {
      const toolbarInner = ev.currentTarget?.querySelector('.toolbar-inner')
      if (!toolbarInner || toolbarInner.scrollWidth <= toolbarInner.clientWidth) {
        return
      }
      const delta = Math.abs(ev.deltaX) > Math.abs(ev.deltaY) ? ev.deltaX : ev.deltaY
      if (!delta) {
        return
      }
      toolbarInner.scrollLeft += delta
      ev.preventDefault()
    },
    onPageAfterIn() {
      if (window) {
        window.addEventListener('keydown', this.keyDown)
      }
      this.load()
    },
    onPageBeforeOut() {
      if (window) {
        window.removeEventListener('keydown', this.keyDown)
      }
      this.detailsOpened = false
    },
    keyDown(ev) {
      if (ev.keyCode === 83 && (ev.ctrlKey || ev.metaKey) && !(ev.altKey || ev.shiftKey)) {
        if (this.editable) {
          this.save(!this.createMode)
        }
        ev.stopPropagation()
        ev.preventDefault()
      }
    },
    stripClosed(obj) {
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
    setParents(widget) {
      // keep parents with widget for drag and drop
      widget.widgets?.forEach((w) => {
        w.parent = widget
        this.setParents(w)
      })
    },
    load() {
      if (this.loading) return
      this.loading = true

      if (this.ready && this.dirty) this.save(true, true)

      if (this.createMode) {
        this.lastCleanSitemap = this.stripClosed(this.sitemap)
        this.loading = false
        this.ready = true
      } else {
        this.$oh.api.get('/rest/sitemaps/' + this.uid + '/definition').then((data) => {
          const sitemap = this.preProcessSitemapLoad(data)
          this.sitemap = sitemap
          nextTick(() => {
            this.lastCleanSitemap = this.stripClosed(this.sitemap)
            this.setParents(this.sitemap)
            this.ready = true
            this.loading = false
          })
        })
      }
    },
    save(stay, force) {
      this.cleanConfig(this.sitemap)
      if (!this.sitemap.name) {
        f7.dialog.alert('Please give an name to the sitemap')
        return
      }
      if (!this.sitemap.label) {
        f7.dialog.alert('Please give a label to the sitemap')
        return
      }
      if (!this.createMode && this.uid !== this.sitemap.name) {
        f7.dialog.alert('You cannot change the name of an existing sitemap. Duplicate it with the new name then delete this one.')
        return
      }

      if (!force && !this.validateWidgets(stay)) return

      const sitemap = this.preProcessSitemapSave(this.sitemap)

      const promise = this.$oh.api.put('/rest/sitemaps/' + sitemap.name, sitemap)
      promise
        .then((data) => {
          this.dirty = false
          if (this.createMode) {
            showToast('Sitemap created')
            this.load()
            this.f7router.navigate(this.f7route.url.replace('/add', '/' + sitemap.name), { reloadCurrent: true })
          } else {
            showToast('Sitemap updated')
            this.lastCleanSitemap = this.stripClosed(this.sitemap)
            this.setParents(sitemap)
          }
          f7.emit('sidebarRefresh', null)
          // if (!stay) this.f7router.back()
        })
        .catch((err) => {
          showToast('Error while saving sitemap: ' + err)
        })
    },
    validateWidgets(stay) {
      let scope = this
      if (Array.isArray(this.sitemap.widgets) && this.sitemap.widgets.length) {
        let validationWarnings = []
        const widgetList = this.sitemap.widgets.reduce(function iter(widgets, widget) {
          widgets.push(widget)
          if (Array.isArray(widget.widgets)) {
            return widget.widgets.reduce(iter, widgets)
          }
          return widgets
        }, [])
        // Check frame widget is not in frame and linkable widget does not contain mix of frames and non-frames
        let isFrame = [false]
        let siblingIsFrame = [undefined]
        this.sitemap.widgets.forEach(function iter(widget) {
          let label = scope.widgetErrorLabel(widget)
          if (isFrame[isFrame.length - 1] && widget.type === 'Frame') {
            validationWarnings.push('Frame widget ' + label + ', frame not allowed in frame')
          }
          if (siblingIsFrame[siblingIsFrame.length - 1] !== undefined) {
            if (
              (siblingIsFrame[siblingIsFrame.length - 1] && widget.type !== 'Frame') ||
              (!siblingIsFrame[siblingIsFrame.length - 1] && widget.type === 'Frame')
            ) {
              validationWarnings.push('Widget ' + label + ', only frames or no frames at all allowed in linkable widget')
            }
          }
          siblingIsFrame.push(siblingIsFrame.pop() || widget.type === 'Frame')
          if (Array.isArray(widget.widgets)) {
            isFrame.push(widget.type === 'Frame')
            siblingIsFrame.push(undefined)
            widget.widgets.forEach(iter)
            isFrame.pop()
            siblingIsFrame.pop()
          }
        })
        // Check frame widget has children
        widgetList
          .filter((widget) => widget.type === 'Frame')
          .forEach((widget) => {
            if (!widget.widgets?.length) {
              let label = scope.widgetErrorLabel(widget)
              validationWarnings.push(widget.type + ' widget ' + label + ' should not be empty')
            }
          })
        // Check widget has item configured if required, except for Buttongrid and Button widgets which can have item on button level or grid level
        widgetList
          .filter((widget) => !this.WIDGET_TYPES_NOT_REQUIRING_ITEM.includes(widget.type))
          .forEach((widget) => {
            if (!widget.item) {
              let label = scope.widgetErrorLabel(widget)
              validationWarnings.push(widget.type + ' widget ' + label + ', no item configured')
            }
          })
        // Check Video and Webview widgets have url configured
        widgetList
          .filter((widget) => widget.type === 'Video' || widget.type === 'Webview')
          .forEach((widget) => {
            if (!widget.url) {
              let label = scope.widgetErrorLabel(widget)
              validationWarnings.push(widget.type + ' widget ' + label + ', no url configured')
            }
          })
        // Check Chart widget has valid period and decimal pattern configured
        widgetList
          .filter((widget) => widget.type === 'Chart')
          .forEach((widget) => {
            if (!(widget.period && this.REGEX_PERIOD.test(widget.period))) {
              let label = scope.widgetErrorLabel(widget)
              validationWarnings.push(widget.type + ' widget ' + label + ', invalid period configured: ' + widget.period)
            }
            if (widget.yAxisDecimalPattern && !this.REGEX_DECIMAL_PATTERN.test(widget.yAxisDecimalPattern)) {
              let label = scope.widgetErrorLabel(widget)
              validationWarnings.push(
                widget.type + ' widget ' + label + ', invalid Y-axis decimal pattern configured: ' + widget.yAxisDecimalPattern
              )
            }
          })
        // Check Input widget has valid inputHint if configured
        widgetList
          .filter((widget) => widget.type === 'Input')
          .forEach((widget) => {
            if (widget.inputHint && !['text', 'number', 'date', 'time', 'datetime'].includes(widget.inputHint)) {
              let label = scope.widgetErrorLabel(widget)
              validationWarnings.push(widget.type + ' widget ' + label + ', invalid inputHint configured: ' + widget.inputHint)
            }
          })
        // Check Slider, Setpoint and Colortemperaturepicker widgets have valid step, minValue and maxValue if configured
        widgetList
          .filter((widget) => ['Slider', 'Setpoint', 'Colortemperaturepicker'].includes(widget.type))
          .forEach((widget) => {
            let label = scope.widgetErrorLabel(widget)
            if (widget.step !== undefined && widget.step !== null && widget.step !== '' && Number(widget.step) <= 0) {
              validationWarnings.push(widget.type + ' widget ' + label + ', step size cannot be 0 or negative: ' + widget.step)
            }
            const minValue = widget.minValue ? parseFloat(widget.minValue) : 0
            const maxValue = widget.maxValue ? parseFloat(widget.maxValue) : 100
            if (minValue > maxValue) {
              validationWarnings.push(
                widget.type + ' widget ' + label + ', minValue must be less than or equal maxValue: ' + minValue + ' > ' + maxValue
              )
            }
          })
        // Check Buttongrid widget has buttons or widgets defined, and if buttons have valid row and column configured.
        // Duplicate row and column are only allowed if there are visibility rules to differentiate them.
        widgetList
          .filter((widget) => widget.type === 'Buttongrid')
          .forEach((widget) => {
            let label = scope.widgetErrorLabel(widget)
            if (!(widget.buttons?.length || widget.widgets?.length)) {
              validationWarnings.push(widget.type + ' widget ' + label + ', no buttons defined')
            }
            const noVisibilityRulePositions = new Set()
            const visibilityRulePositions = new Set()
            if (widget.buttons?.length && !widget.item) {
              validationWarnings.push(
                widget.type + ' widget ' + label + ', To use the buttons parameter in a Buttongrid, the item parameter is required'
              )
              return
            }
            widget.buttons?.forEach((param) => {
              const row = Number(param.row)
              const column = Number(param.column)
              if (!(row > 0)) {
                validationWarnings.push(widget.type + ' widget ' + label + ', Buttongrid button must have positive row index')
              }
              if (!(column > 0)) {
                validationWarnings.push(widget.type + ' widget ' + label + ', Buttongrid button must have positive column index')
              }
              const key = row + ':' + column
              if (row > 0 && column > 0 && noVisibilityRulePositions.has(key)) {
                validationWarnings.push(
                  widget.type + ' widget ' + label + ', Buttongrid button already exists for position (' + row + ',' + column + ')'
                )
              }
              noVisibilityRulePositions.add(key)
            })
            let invalidChildFound = false
            widget.widgets?.forEach((child) => {
              if (invalidChildFound) {
                return
              }
              if (child.type !== 'Button') {
                validationWarnings.push(widget.type + ' widget ' + label + ', Buttongrid must contain only Buttons')
                invalidChildFound = true
                return
              }
              const childLabel = scope.widgetErrorLabel(child)
              const hasVisibilityRule = Array.isArray(child.visibilityRules) && child.visibilityRules.length > 0
              const row = Number(child.row)
              const column = Number(child.column)
              if (!(row > 0)) {
                validationWarnings.push('Button widget ' + childLabel + ", doesn't have positive row index defined")
              }
              if (!(column > 0)) {
                validationWarnings.push('Button widget ' + childLabel + ", doesn't have positive column index defined")
              }
              const key = row + ':' + column
              if (row > 0 && column > 0) {
                if (!hasVisibilityRule) {
                  if (noVisibilityRulePositions.has(key)) {
                    validationWarnings.push('Button widget ' + childLabel + ', already exists for position (' + row + ',' + column + ')')
                  }
                  if (visibilityRulePositions.has(key)) {
                    validationWarnings.push(
                      'Button widget ' +
                        childLabel +
                        ', with and without visibilityRules rule for same position (' +
                        row +
                        ',' +
                        column +
                        ')'
                    )
                  }
                  noVisibilityRulePositions.add(key)
                } else {
                  if (noVisibilityRulePositions.has(key)) {
                    validationWarnings.push(
                      'Button widget ' +
                        childLabel +
                        ', without and with visibilityRules rule for same position (' +
                        row +
                        ',' +
                        column +
                        ')'
                    )
                  }
                  if (visibilityRulePositions.has(key)) {
                    validationWarnings.push('Button widget ' + childLabel + ', already exists for position (' + row + ',' + column + ')')
                  }
                  visibilityRulePositions.add(key)
                }
              }
              if (!child.command) {
                validationWarnings.push('Button widget ' + childLabel + ", doesn't have click command defined")
              }
            })
          })
        // Check Button widget is inside a Buttongrid and has valid row, column and command configured
        widgetList
          .filter((widget) => widget.type === 'Button')
          .forEach((widget) => {
            let label = scope.widgetErrorLabel(widget)
            let parentWidget = widgetList.find((w) => {
              if (w.widgets?.includes(widget)) return w
              return undefined
            })
            if (!(parentWidget?.type === 'Buttongrid')) {
              validationWarnings.push(widget.type + ' widget ' + label + ', can only be defined inside a Buttongrid widget')
              if (!widget.row || isNaN(widget.row) || widget.row <= 0) {
                validationWarnings.push(widget.type + ' widget ' + label + ', invalid row configured: ' + widget.row)
              }
              if (!widget.column || isNaN(widget.column) || widget.column <= 0) {
                validationWarnings.push(widget.type + ' widget ' + label + ', invalid column configured: ' + widget.column)
              }
              if (!widget.command) {
                validationWarnings.push(widget.type + ' widget ' + label + ', no click command defined')
              }
            } else {
              if (widget.column && !isNaN(widget.column) && widget.column > this.MAX_BUTTONGRID_COLUMNS) {
                validationWarnings.push(widget.type + ' widget ' + label + ', invalid column configured: ' + widget.column)
              }
            }
          })
        widgetList.forEach((widget) => {
          let label = scope.widgetErrorLabel(widget)
          Object.keys(widget)
            .filter((attr) =>
              ['buttons', 'mappings', 'visibilityRules', 'valueColorRules', 'labelColorRules', 'iconColorRules', 'iconRules'].includes(attr)
            )
            .forEach((attr) => {
              widget[attr].forEach((param) => {
                if (attr === 'mappings' && !this.validateMapping(param)) {
                  validationWarnings.push(
                    widget.type + ' widget ' + label + ', syntax error in ' + attr + ': ' + param.command + '=' + param.label
                  )
                }
                if (attr === 'buttons') {
                  const column = Number(param.column)
                  if (column > this.MAX_BUTTONGRID_COLUMNS) {
                    validationWarnings.push(widget.type + ' widget ' + label + ', invalid column configured: ' + param.column)
                  }
                  if (!this.validateMapping(param)) {
                    validationWarnings.push(
                      widget.type + ' widget ' + label + ', syntax error in button command: ' + param.command + '=' + param.label
                    )
                  }
                }
                if (
                  ['visibilityRules', 'valueColorRules', 'labelColorRules', 'iconColorRules', 'iconRules'].includes(attr) &&
                  !this.validateRule(attr, param)
                ) {
                  validationWarnings.push(widget.type + ' widget ' + label + ', syntax error in ' + attr)
                }
              })
            })
        })
        if (validationWarnings.length > 0) {
          f7.dialog
            .create({
              cssClass: 'sitemap-validation-dialog',
              title: 'Validation errors',
              text: 'Sitemap definition has validation errors:',
              content: '<ul style="max-height: 200px; overflow-y: scroll"><li>' + validationWarnings.join('</li><li>') + '</li></ul>',
              buttons: [
                { text: 'Cancel', color: 'gray', close: true },
                { text: 'Save Anyway', color: 'red', close: true, onClick: () => this.save(stay, true) }
              ],
              destroyOnClose: true
            })
            .open()
          return false
        }
      }
      return true
    },
    widgetErrorLabel(widget) {
      return widget.label ?? (widget.item ? 'for item ' + widget.item : 'without label')
    },
    validateMapping(mapping) {
      return mapping.command?.length && (mapping.label?.length || mapping.icon?.length)
    },
    validateRule(attr, rule) {
      if (rule.conditions?.some((condition) => condition.value === null || condition.value === undefined)) {
        return false
      }
      if (attr !== 'visibilityRules') {
        return rule.argument !== null && rule.argument !== undefined
      }
      return true
    },
    cleanConfig(widget) {
      for (let key in widget) {
        if (widget[key] && Array.isArray(widget[key])) {
          widget[key] = widget[key].filter(Boolean)
          if (key === 'buttons') {
            widget[key].sort((value1, value2) => value1.row - value2.row || value1.column - value2.column)
          }
        }
        if (!widget[key] && widget[key] !== 0) {
          delete widget[key]
        }
      }
      if (widget.type === 'Buttongrid') {
        widget.widgets?.sort((button1, button2) => (button1.row ?? 0) - (button2.row ?? 0) || (button1.column ?? 0) - (button2.column ?? 0))
      }
      this.addEmptySlot(widget)
      widget.widgets?.forEach(this.cleanConfig)
    },
    preProcessSitemapLoad(sitemap) {
      const processed = JSON.parse(JSON.stringify(sitemap))
      processed.type = 'Sitemap' // ensure type is set to Sitemap for the root element
      if (processed.widgets) {
        processed.widgets.forEach(this.preProcessWidgetLoad)
      }
      return processed
    },
    preProcessWidgetLoad(widget) {
      this.addEmptySlot(widget)
      widget.widgets?.forEach(this.preProcessWidgetLoad)
    },
    addEmptySlot(widget) {
      // Needed for drag and drop to work into empty slot
      if (this.LINKABLE_WIDGET_TYPES.includes(widget.type)) {
        if (!widget.widgets) {
          widget.widgets = []
        }
      }
    },
    preProcessSitemapSave(sitemap) {
      const processed = cloneDeep(sitemap)
      processed.widgets?.forEach(this.preProcessWidgetSave)
      return processed
    },
    preProcessWidgetSave(widget) {
      delete widget.parent // remove parent from widget, as this would cause a circular reference error when converting to JSON
      widget.widgets?.forEach(this.preProcessWidgetSave)
    },
    update(value) {
      this.selectedWidget = null
      this.selectedWidgetParent = null
      this.sitemap = value
      this.cleanConfig(this.sitemap)
    },
    startEventSource() {},
    stopEventSource() {},
    duplicateWidget() {
      const duplicate = cloneDeep(this.selectedWidget)
      const index = this.selectedWidgetParent.widgets.indexOf(this.selectedWidget) + 1
      this.selectedWidgetParent.widgets.splice(index, 0, duplicate)
      this.selectedWidget = this.selectedWidgetParent.widgets[index]
    },
    removeWidget() {
      this.selectedWidgetParent.widgets.splice(this.selectedWidgetParent.widgets.indexOf(this.selectedWidget), 1)
      if (!this.selectedWidgetParent.widgets.length) {
        delete this.selectedWidgetParent
      }
      this.selectedWidget = null
      this.selectedWidgetParent = null
    },
    moveWidgetDown() {
      let widgets = this.selectedWidgetParent.widgets
      let pos = widgets.indexOf(this.selectedWidget)
      if (pos >= widgets.length - 1) return
      widgets.splice(pos, 1)
      widgets.splice(pos + 1, 0, this.selectedWidget)
    },
    moveWidgetUp() {
      let widgets = this.selectedWidgetParent.widgets
      let pos = widgets.indexOf(this.selectedWidget)
      if (pos <= 0) return
      widgets.splice(pos, 1)
      widgets.splice(pos - 1, 0, this.selectedWidget)
    },
    selectWidget(widgets) {
      const widget = widgets[0]
      const parentWidget = widgets[1]
      this.selectedWidget = null
      this.selectedWidgetParent = null
      nextTick(() => {
        this.selectedWidget = widget
        this.selectedWidgetParent = parentWidget
        this.detailsTab = 'widget'
        nextTick(() => {
          const detailsLink = this.$refs.detailsLink
          if (!detailsLink) {
            console.warn('detailsLink ref not found - should not occur')
            return
          }
          const visibility = window.getComputedStyle(detailsLink.$el).visibility
          if (!visibility || visibility !== 'hidden') {
            this.detailsOpened = true
          }
        })
      })
    },
    clearSelection(ev) {
      if (ev.target && ev.currentTarget && ev.target === ev.currentTarget) {
        this.selectedWidget = null
        this.selectedWidgetParent = null
      }
    },
    addWidget(widgetType) {
      if (!this.selectedWidget.widgets) {
        this.selectedWidget.widgets = []
      }
      const widget = {
        type: widgetType
      }
      this.selectedWidget.widgets.push(widget)
      this.selectWidget([widget, this.selectedWidget])
      this.detailsTab = 'widget'
    }
  }
}
</script>
