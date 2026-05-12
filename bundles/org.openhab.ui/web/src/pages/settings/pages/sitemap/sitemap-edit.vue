<template>
  <f7-page class="sitemap-editor" ref="sitemap-edit-page" @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar no-hairline>
      <oh-nav-content
        :title="!ready ? '' : (createMode ? 'Create sitemap' : 'Sitemap: ' + sitemap.label) + dirtyIndicator"
        :editable="isEditable"
        :save-link="`Save${$device.desktop ? ' (Ctrl-S)' : ''}`"
        @save="save()"
        :f7router>
      </oh-nav-content>
    </f7-navbar>
    <f7-toolbar tabbar position="top">
      <f7-link @click="switchTab('tree')" :tab-link-active="currentTab === 'tree'"> Design </f7-link>
      <f7-link @click="switchTab('code')" :tab-link-active="currentTab === 'code'"> Code </f7-link>
    </f7-toolbar>
    <not-editable-notice v-if="currentTab === 'tree' && !isEditable" class="sitemap-not-editable" subject="sitemap" />
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
        <f7-block class="sitemap-tree-wrapper" :class="{ 'sheet-opened': detailsOpened }">
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
                    :editable="isEditable" />
                </f7-treeview>
              </f7-block>
            </f7-col>
            <f7-col class="details-pane sitemap-details-no-spinners">
              <f7-block v-if="selectedWidget" no-gap>
                <widget-details
                  :widget="selectedWidget"
                  :createMode="createMode"
                  :editable="isEditable"
                  @duplicate="duplicateWidget"
                  @remove="removeWidget"
                  @movedown="moveWidgetDown"
                  @moveup="moveWidgetUp" />
              </f7-block>
              <f7-block v-else>
                <div class="padding text-align-center">Nothing selected</div>
              </f7-block>
              <f7-block
                v-if="selectedWidget && selectedWidget.type !== 'Sitemap' && (isEditable || selectedWidget.visibilityRules?.length)">
                <div><f7-block-title>Visibility</f7-block-title></div>
                <attribute-details
                  :widget="selectedWidget"
                  attribute="visibilityRules"
                  :fields="visibilityRulesFields"
                  :disabled="!isEditable" />
              </f7-block>
              <f7-block
                v-if="
                  selectedWidget && ['Switch', 'Selection'].includes(selectedWidget.type) && (isEditable || selectedWidget.mappings?.length)
                ">
                <div><f7-block-title>Mappings</f7-block-title></div>
                <attribute-details
                  :widget="selectedWidget"
                  attribute="mappings"
                  :fields="selectedWidget.type === 'Switch' ? switchMappingFields : selectionMappingFields"
                  :disabled="!isEditable" />
              </f7-block>
              <f7-block v-if="selectedWidget && selectedWidget.type !== 'Sitemap' && (isEditable || selectedWidget.iconRules?.length)">
                <div><f7-block-title>Icon Rules</f7-block-title></div>
                <attribute-details :widget="selectedWidget" attribute="iconRules" :fields="iconRulesFields" :disabled="!isEditable" />
              </f7-block>
              <f7-block
                v-if="selectedWidget && selectedWidget.type !== 'Sitemap' && (isEditable || selectedWidget.labelColorRules?.length)">
                <div><f7-block-title>Label Color</f7-block-title></div>
                <attribute-details
                  :widget="selectedWidget"
                  attribute="labelColorRules"
                  :fields="colorRulesFields"
                  :disabled="!isEditable" />
              </f7-block>
              <f7-block v-if="selectedWidget && canShowValue && (isEditable || selectedWidget.valueColorRules?.length)">
                <div><f7-block-title>Value Color</f7-block-title></div>
                <attribute-details
                  :widget="selectedWidget"
                  attribute="valueColorRules"
                  :fields="colorRulesFields"
                  :disabled="!isEditable" />
              </f7-block>
              <f7-block v-if="selectedWidget && selectedWidget.type !== 'Sitemap' && (isEditable || selectedWidget.iconColorRules?.length)">
                <div><f7-block-title>Icon Color</f7-block-title></div>
                <attribute-details :widget="selectedWidget" attribute="iconColorRules" :fields="colorRulesFields" :disabled="!isEditable" />
              </f7-block>
              <f7-block v-if="isEditable && selectedWidget && canAddChildren(selectedWidget) && selectedWidget.type !== 'Buttongrid'">
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
              <f7-block v-if="isEditable && selectedWidget && canAddChildren(selectedWidget) && selectedWidget.type === 'Buttongrid'">
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
      <f7-tab v-if="sitemap" id="code" :tab-active="currentTab === 'code' ? true : null">
        <code-editor
          v-if="ready"
          ref="codeEditor"
          object-type="sitemaps"
          :object="preProcessSitemapSave(sitemap)"
          :object-id="sitemap.name"
          :read-only="!isEditable"
          @parsed="update"
          @changed="onCodeChanged" />
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
      class="sitemap-details-sheet sitemap-details-no-spinners"
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
            v-if="selectedWidget && selectedWidget.type !== 'Sitemap' && (isEditable || selectedWidget.visibilityRules?.length)"
            class="padding-left padding-right"
            :tab-link-active="detailsTab === 'visibilityRules'"
            @click="detailsTab = 'visibilityRules'">
            Visibility
          </f7-link>
          <f7-link
            v-if="
              selectedWidget && ['Switch', 'Selection'].includes(selectedWidget.type) && (isEditable || selectedWidget.mappings?.length)
            "
            class="padding-left padding-right"
            :tab-link-active="detailsTab === 'mappings'"
            @click="detailsTab = 'mappings'">
            Mappings
          </f7-link>
          <f7-link
            v-if="selectedWidget && selectedWidget.type !== 'Sitemap' && (isEditable || selectedWidget.iconRules?.length)"
            class="padding-left padding-right"
            :tab-link-active="detailsTab === 'icons'"
            @click="detailsTab = 'icons'">
            Icons
          </f7-link>
          <f7-link
            v-if="
              selectedWidget &&
              selectedWidget.type !== 'Sitemap' &&
              (isEditable ||
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
            :editable="isEditable"
            @duplicate="duplicateWidget"
            @remove="removeWidget"
            @movedown="moveWidgetDown"
            @moveup="moveWidgetUp" />
        </f7-block>
        <f7-block v-if="selectedWidget && detailsTab === 'visibilityRules'" style="margin-bottom: 6rem">
          <attribute-details :widget="selectedWidget" attribute="visibilityRules" :fields="visibilityRulesFields" :disabled="!isEditable" />
        </f7-block>
        <f7-block v-if="selectedWidget && detailsTab === 'mappings'" style="margin-bottom: 6rem">
          <attribute-details
            :widget="selectedWidget"
            attribute="mappings"
            :fields="selectedWidget.type === 'Switch' ? switchMappingFields : selectionMappingFields"
            :disabled="!isEditable" />
        </f7-block>
        <f7-block v-if="selectedWidget && detailsTab === 'icons'" style="margin-bottom: 6rem">
          <attribute-details :widget="selectedWidget" attribute="iconRules" :fields="iconRulesFields" :disabled="!isEditable" />
        </f7-block>
        <f7-block v-if="selectedWidget && detailsTab === 'colors'" style="margin-bottom: 6rem">
          <div v-if="isEditable || selectedWidget.labelColorRules?.length">
            <f7-block-title>Label Color</f7-block-title>
            <attribute-details :widget="selectedWidget" attribute="labelColorRules" :fields="colorRulesFields" :disabled="!isEditable" />
          </div>
          <div v-if="canShowValue && (isEditable || selectedWidget.valueColorRules?.length)">
            <f7-block-title>Value Color</f7-block-title>
            <attribute-details :widget="selectedWidget" attribute="valueColorRules" :fields="colorRulesFields" :disabled="!isEditable" />
          </div>
          <div v-if="isEditable || selectedWidget.iconColorRules?.length">
            <f7-block-title>Icon Color</f7-block-title>
            <attribute-details :widget="selectedWidget" attribute="iconColorRules" :fields="iconRulesFields" :disabled="!isEditable" />
          </div>
        </f7-block>
      </f7-page>
    </f7-sheet>
  </f7-page>
</template>

<style lang="stylus">
.sitemap-editor .page-content
  display flex
  flex-direction column
  overflow hidden !important
.tabs.sitemap-editor-tabs
  flex 1
  min-height 0
  display flex
  flex-direction column
  height 100%
  overflow hidden
  .tab
    height 100%
  .design
    --f7-grid-gap 0px
    overflow auto
  .tab-active
    flex 1
    min-height 0
    overflow-y auto
.block.sitemap-not-editable
  flex-shrink 0

.sitemap-not-editable
  margin-bottom 0
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
/* Spinners overlap with clear button, so hide them */
.sitemap-details-no-spinners input::-webkit-outer-spin-button,
.sitemap-details-no-spinners input::-webkit-inner-spin-button
  -webkit-appearance none !important
  margin 0 !important
.sitemap-details-no-spinners input[type=number]
  -moz-appearance textfield !important

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
  .sitemap-tree
    margin-top 0 !important
  .sitemap-tree-wrapper.sheet-opened
    margin-bottom calc(var(--f7-sheet-height) - var(--f7-toolbar-height))
    height auto
  .details-sheet
    height calc(1.4*var(--f7-sheet-height))
</style>

<script>
import { nextTick, defineAsyncComponent } from 'vue'
import { f7 } from 'framework7-vue'
import { mapWritableState } from 'pinia'

import cloneDeep from 'lodash/cloneDeep'

import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'

import NotEditableNotice from '@/components/util/not-editable-notice.vue'
import WidgetDetails from '@/components/pagedesigner/sitemap/widget-details.vue'
import AttributeDetails from '@/components/pagedesigner/sitemap/attribute-details.vue'
import SitemapTreeviewItem from '@/components/pagedesigner/sitemap/treeview-item.vue'
import SitemapMixin from '@/components/pagedesigner/sitemap/sitemap-mixin'
import FileDefinition from '@/pages/settings/file-definition-mixin'
import fastDeepEqual from 'fast-deep-equal/es6'
import { showToast } from '@/js/dialog-promises'
import { useDirty } from '@/pages/useDirty'

import * as api from '@/api'

export default {
  mixins: [SitemapMixin, FileDefinition],
  components: {
    NotEditableNotice,
    WidgetDetails,
    AttributeDetails,
    SitemapTreeviewItem,
    CodeEditor: defineAsyncComponent(() => import(/* webpackChunkName: "code-editor" */ '@/components/config/controls/code-editor.vue'))
  },
  props: {
    createMode: Boolean,
    uid: String,
    itemsList: Array,
    sitemapCopy: Object,
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
      codeDirty: false,
      sitemapDirty: false,
      sitemap: {
        name: 'sitemap_' + f7.utils.id(),
        type: 'Sitemap',
        icon: '',
        label: 'New Sitemap',
        widgets: []
      },
      sitemaps: [],
      lastCleanSitemap: null,
      selectedWidget: null,
      selectedWidgetParent: null,
      previousSelection: null,
      detailsOpened: false,
      detailsTab: 'widget',
      currentTab: 'tree',
      eventSource: null,
      defaultFalseWidgetBooleans: ['staticIcon', 'switchSupport', 'releaseOnly', 'forceAsItem', 'stateless'],
      switchMappingFields: [
        { command: { width: '10%', placeholder: 'cmd', required: true } },
        ':',
        { releaseCommand: { width: '10%', placeholder: '[release]' } },
        '=',
        { label: { width: '20%', placeholder: 'label', required: true } },
        '=',
        { icon: { placeholder: '[icon]' } }
      ],
      selectionMappingFields: [
        { command: { width: '20%', placeholder: 'cmd', required: true } },
        '=',
        { label: { width: '20%', placeholder: 'label', required: true } },
        '=',
        { icon: { placeholder: '[icon]' } }
      ],
      visibilityRulesFields: [
        {
          conditions: [
            { item: { width: '30%', type: 'item', placeholder: '[item]' } },
            { condition: { width: '0%', type: 'operator' } },
            { value: { placeholder: 'value', required: true } }
          ]
        }
      ],
      iconRulesFields: [
        {
          conditions: [
            { item: { width: '30%', type: 'item', placeholder: '[item]' } },
            { condition: { width: '0%', type: 'operator' } },
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
            { condition: { width: '0%', type: 'operator' } },
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
    isEditable() {
      return !this.sitemap || (this.sitemap.editable ?? true)
    },
    addableWidgetTypes() {
      if (!this.selectedWidget) return []
      return this.allowedWidgetTypes(this.selectedWidget)
    },
    ...mapWritableState(useUIOptionsStore, {
      sitemapIncludeItemName: 'sitemapShowItemName'
    }),
    preProcessedSitemap() {
      return this.currentTab === 'code' ? this.preProcessSitemapSave(this.sitemap) : undefined
    }
  },
  watch: {
    sitemap: {
      handler(newVal) {
        if (this.loading) return
        if (!fastDeepEqual(this.stripClosed(newVal), this.lastCleanSitemap)) {
          this.sitemapDirty = true
        } else {
          this.sitemapDirty = false
        }
      },
      deep: true
    },
    codeDirty() {
      this.dirty = this.sitemapDirty || this.codeDirty
    },
    sitemapDirty() {
      this.dirty = this.sitemapDirty || this.codeDirty
    },
    currentTab(newTab, oldTab) {
      if (oldTab === 'tree') {
        this.$refs.detailsSheet?.$el?.f7Modal?.close?.()
      }
    }
  },
  methods: {
    createDefaultSitemapName() {
      return 'sitemap_' + f7.utils.id()
    },
    selectRootSitemapWidget() {
      this.selectedWidget = this.sitemap
      this.selectedWidgetParent = null
    },
    initializeCreateModeSitemap() {
      if (this.sitemapCopy) {
        const sitemapCopy = this.preProcessSitemapLoad(this.sitemapCopy)
        sitemapCopy.name = this.createDefaultSitemapName()
        this.sitemap = sitemapCopy
      }
      this.selectRootSitemapWidget()
    },
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
    switchTab(newTab) {
      if (this.currentTab === newTab) return

      if (newTab === 'code') {
        // Switching to code tab: set immediately, then generate
        this.currentTab = newTab
        nextTick(() => {
          this.$refs.codeEditor?.generateCode?.()
        })
      } else if (this.codeDirty) {
        // Switching from code tab with dirty code: parse first, then switch on success
        this.$refs.codeEditor.parseCode(
          () => {
            this.currentTab = newTab
            this.codeDirty = false
            this.dirty = this.sitemapDirty
          },
          () => {
            // Parse failed: stay in code tab
            this.currentTab = 'code'
            f7.tab.show('#code')
          }
        )
      } else {
        // Switching from code tab with clean code: switch immediately
        this.currentTab = newTab
      }
    },
    onCodeChanged(codeDirty) {
      this.codeDirty = codeDirty
      this.dirty = this.sitemapDirty || this.codeDirty
    },
    keyDown(ev) {
      if (ev.keyCode === 83 && (ev.ctrlKey || ev.metaKey) && !(ev.altKey || ev.shiftKey)) {
        if (this.isEditable) {
          this.save(!this.createMode)
        }
        ev.stopPropagation()
        ev.preventDefault()
      }
    },
    stripClosed(obj) {
      // Remove the closed and parents field as it is only used for expanding the tree, and should not impact the dirty state
      if (Array.isArray(obj)) {
        return obj.map(this.stripClosed)
      } else if (obj !== null && typeof obj === 'object') {
        // also exclude parent to avoid recursive copies
        const { parent, closed, ...rest } = obj
        const result = {}
        for (const key in rest) {
          const value = this.stripClosed(rest[key])
          if (value === false && this.defaultFalseWidgetBooleans.includes(key)) continue
          if (value === '') continue
          if (Array.isArray(value) && value.length === 0) continue
          result[key] = value
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
        this.initializeCreateModeSitemap()
        api
          .getSitemapDefinitions()
          .then((sitemaps) => {
            this.sitemaps = sitemaps.map((sitemap) => sitemap.name)
            this.ready = true
          })
          .catch((err) => {
            console.error(err)
            showToast('An error occurred while loading sitemaps: ' + (err?.message || String(err)))
          })
          .finally(() => {
            this.loading = false
          })
        this.lastCleanSitemap = this.sitemapCopy ? null : this.stripClosed(this.sitemap)
        this.sitemapDirty = !!this.sitemapCopy
        this.dirty = this.sitemapDirty || this.codeDirty
      } else {
        api
          .getSitemapDefinitionByName({ sitemapname: this.uid })
          .then((data) => {
            const sitemap = this.preProcessSitemapLoad(data)
            this.lastCleanSitemap = this.stripClosed(sitemap)
            this.sitemap = sitemap
            this.selectRootSitemapWidget()
            nextTick(() => {
              this.ready = true
            })
          })
          .catch((err) => {
            console.error(err)
            showToast('An error occurred while loading sitemap: ' + (err?.message || String(err)))
          })
          .finally(() => {
            this.loading = false
          })
      }
    },
    save(stay, force) {
      if (!this.isEditable) return
      if (this.currentTab === 'code' && this.codeDirty) {
        this.$refs.codeEditor.parseCode(
          () => {
            this.codeDirty = false
            this.dirty = this.sitemapDirty
            this.save(stay, true)
          },
          () => {
            this.currentTab = 'code'
            f7.tab.show('#code')
            showToast('Please fix errors in the code before saving.')
          }
        )
        return
      }
      if (!this.sitemap.name) {
        f7.dialog.alert('Please give a name to the sitemap')
        return
      }
      if (this.createMode && this.isExistingSitemap(this.sitemap.name)) {
        f7.dialog.alert('A sitemap with the name ' + this.sitemap.name + ' already exists. Please choose another name.')
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

      api
        .addOrUpdateSitemapInRegistry({ sitemapname: sitemap.name, sitemapDefinition: sitemap })
        .then((data) => {
          this.sitemapDirty = this.codeDirty = false
          this.dirty = false
          if (this.createMode) {
            showToast('Sitemap created')
            const targetUrl = (this.f7route?.url || '').replace(/\/(add|duplicate)(?:\/)?$/, '/' + sitemap.name)
            this.f7router.navigate(targetUrl || '/settings/sitemaps/' + sitemap.name, { reloadCurrent: true })
          } else {
            showToast('Sitemap updated')
            this.lastCleanSitemap = this.stripClosed(this.sitemap)
          }
          f7.emit('sidebarRefresh', null)
        })
        .catch((err) => {
          showToast('Error while saving sitemap: ' + (err?.message || String(err)))
        })
    },
    isExistingSitemap(name) {
      return this.sitemaps.includes(name)
    },
    validateWidgets(stay) {
      let scope = this
      const validationWarnings = []
      if (!Array.isArray(this.sitemap.widgets) || !this.sitemap.widgets.length) {
        const label = scope.widgetErrorLabel(this.sitemap)
        validationWarnings.push('Sitemap ' + label + ' should have at least one widget')
      } else {
        const registeredItemNames = this.itemsReady ? new Set(this.items.map((item) => item.name)) : null
        const widgetList = this.sitemap.widgets.reduce(function iter(widgets, widget) {
          widgets.push(widget)
          if (Array.isArray(widget.widgets)) {
            return widget.widgets.reduce(iter, widgets)
          }
          return widgets
        }, [])
        // Check frame widget is not in frame and linkable widget does not contain mix of frames and non-frames
        const isFrame = [false]
        const siblingIsFrame = [undefined]
        this.sitemap.widgets.forEach(function iter(widget) {
          const label = scope.widgetErrorLabel(widget)
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
              const label = scope.widgetErrorLabel(widget)
              validationWarnings.push(widget.type + ' widget ' + label + ' should not be empty')
            }
          })
        // Check widget has item configured if required
        widgetList
          .filter((widget) => !this.WIDGET_TYPES_NOT_REQUIRING_ITEM.includes(widget.type))
          .forEach((widget) => {
            if (!widget.item) {
              const label = scope.widgetErrorLabel(widget)
              validationWarnings.push(widget.type + ' widget ' + label + ', no item configured')
            }
          })
        // Check configured widget item exists in item registry
        widgetList
          .filter((widget) => widget.item)
          .forEach((widget) => {
            if (registeredItemNames && !registeredItemNames.has(widget.item)) {
              const label = scope.widgetErrorLabel(widget)
              validationWarnings.push(widget.type + ' widget ' + label + ', invalid item configured: ' + widget.item)
            }
          })
        // Check Video and Webview widgets have url configured
        widgetList
          .filter((widget) => widget.type === 'Video' || widget.type === 'Webview')
          .forEach((widget) => {
            if (!widget.url) {
              const label = scope.widgetErrorLabel(widget)
              validationWarnings.push(widget.type + ' widget ' + label + ', no url configured')
            }
          })
        // Check Chart widget has valid period and decimal pattern configured
        widgetList
          .filter((widget) => widget.type === 'Chart')
          .forEach((widget) => {
            if (!(widget.period && this.REGEX_PERIOD.test(widget.period))) {
              const label = scope.widgetErrorLabel(widget)
              validationWarnings.push(widget.type + ' widget ' + label + ', invalid period configured: ' + widget.period)
            }
            if (widget.yAxisDecimalPattern && !this.REGEX_DECIMAL_PATTERN.test(widget.yAxisDecimalPattern)) {
              const label = scope.widgetErrorLabel(widget)
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
              const label = scope.widgetErrorLabel(widget)
              validationWarnings.push(widget.type + ' widget ' + label + ', invalid inputHint configured: ' + widget.inputHint)
            }
          })
        // Check Slider, Setpoint and Colortemperaturepicker widgets have valid step, minValue and maxValue if configured
        widgetList
          .filter((widget) => ['Slider', 'Setpoint', 'Colortemperaturepicker'].includes(widget.type))
          .forEach((widget) => {
            const label = scope.widgetErrorLabel(widget)
            if (widget.step !== undefined && widget.step !== null && widget.step !== '' && Number(widget.step) <= 0) {
              validationWarnings.push(widget.type + ' widget ' + label + ', step size cannot be 0 or negative: ' + widget.step)
            }
            const hasMinValue = widget.minValue !== undefined && widget.minValue !== null && widget.minValue !== ''
            const hasMaxValue = widget.maxValue !== undefined && widget.maxValue !== null && widget.maxValue !== ''
            const minValue = hasMinValue ? parseFloat(widget.minValue) : 0
            const maxValue = hasMaxValue ? parseFloat(widget.maxValue) : 100
            if (minValue > maxValue) {
              validationWarnings.push(
                widget.type + ' widget ' + label + ', minValue must be less than or equal maxValue: ' + minValue + ' > ' + maxValue
              )
            }
          })
        // Check Buttongrid widget has widgets defined.
        // Duplicate row and column are only allowed if there are visibility rules to differentiate them
        widgetList
          .filter((widget) => widget.type === 'Buttongrid')
          .forEach((widget) => {
            const label = scope.widgetErrorLabel(widget)
            if (!widget.widgets?.length) {
              validationWarnings.push(widget.type + ' widget ' + label + ', no buttons defined')
            }
            const noVisibilityRulePositions = new Set()
            const visibilityRulePositions = new Set()
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
                  visibilityRulePositions.add(key)
                }
              }
              if (child.command === null || child.command === undefined || child.command === '') {
                validationWarnings.push('Button widget ' + childLabel + ", doesn't have click command defined")
              }
            })
          })
        // Check Button widget is inside a Buttongrid and has valid row, column and command configured
        widgetList
          .filter((widget) => widget.type === 'Button')
          .forEach((widget) => {
            const label = scope.widgetErrorLabel(widget)
            const parentWidget = widgetList.find((w) => {
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
              if (widget.command === null || widget.command === undefined || widget.command === '') {
                validationWarnings.push(widget.type + ' widget ' + label + ', no click command defined')
              }
            } else {
              if (widget.column && !isNaN(widget.column) && widget.column > this.MAX_BUTTONGRID_COLUMNS) {
                validationWarnings.push(widget.type + ' widget ' + label + ', invalid column configured: ' + widget.column)
              }
            }
          })
        widgetList.forEach((widget) => {
          const label = scope.widgetErrorLabel(widget)
          Object.keys(widget)
            .filter((attr) =>
              ['mappings', 'visibilityRules', 'valueColorRules', 'labelColorRules', 'iconColorRules', 'iconRules'].includes(attr)
            )
            .forEach((attr) => {
              widget[attr].forEach((param) => {
                if (attr === 'mappings' && !this.validateMapping(param)) {
                  validationWarnings.push(
                    widget.type + ' widget ' + label + ', syntax error in ' + attr + ': ' + param.command + '=' + param.label
                  )
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
      }
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
      return true
    },
    widgetErrorLabel(widget) {
      return widget.label ?? (widget.item ? 'for item ' + widget.item : 'without label')
    },
    validateMapping(mapping) {
      return mapping.command?.length && (mapping.label?.length || mapping.icon?.length)
    },
    validateRule(attr, rule) {
      if (rule.conditions?.some((condition) => !this.isNonEmptyValue(condition.value))) {
        return false
      }
      if (attr !== 'visibilityRules') {
        return this.isNonEmptyValue(rule.argument)
      }
      return true
    },
    isNonEmptyValue(value) {
      if (typeof value === 'string') {
        return value !== ''
      }
      return value !== null && value !== undefined
    },
    sanitizeRuleCondition(condition) {
      if (!condition || typeof condition !== 'object' || Array.isArray(condition)) {
        return null
      }
      const sanitizedCondition = {}
      ;['item', 'condition', 'value'].forEach((key) => {
        if (this.isNonEmptyValue(condition[key])) {
          sanitizedCondition[key] = condition[key]
        }
      })
      return Object.keys(sanitizedCondition).length ? sanitizedCondition : null
    },
    sanitizeRuleEntry(rule) {
      if (!rule || typeof rule !== 'object' || Array.isArray(rule)) {
        return null
      }
      const sanitizedRule = {}
      if (Array.isArray(rule.conditions)) {
        const sanitizedConditions = rule.conditions.map((condition) => this.sanitizeRuleCondition(condition)).filter(Boolean)
        if (sanitizedConditions.length) {
          sanitizedRule.conditions = sanitizedConditions
        }
      }
      if (this.isNonEmptyValue(rule.argument)) {
        sanitizedRule.argument = rule.argument
      }
      return Object.keys(sanitizedRule).length ? sanitizedRule : null
    },
    sanitizeRuleAttributes(widget) {
      const ruleAttributes = ['visibilityRules', 'valueColorRules', 'labelColorRules', 'iconColorRules', 'iconRules']
      ruleAttributes.forEach((ruleAttribute) => {
        if (!Array.isArray(widget[ruleAttribute])) {
          return
        }
        widget[ruleAttribute] = widget[ruleAttribute].map((rule) => this.sanitizeRuleEntry(rule)).filter(Boolean)
        if (!widget[ruleAttribute].length) {
          delete widget[ruleAttribute]
        }
      })
    },
    sanitizeMappingEntry(mapping) {
      if (!mapping || typeof mapping !== 'object' || Array.isArray(mapping)) {
        return null
      }
      const sanitizedMapping = {}
      Object.keys(mapping).forEach((key) => {
        if (this.isNonEmptyValue(mapping[key])) {
          sanitizedMapping[key] = mapping[key]
        }
      })
      return Object.keys(sanitizedMapping).length ? sanitizedMapping : null
    },
    sanitizeMappings(widget) {
      if (!Array.isArray(widget.mappings)) {
        return
      }
      widget.mappings = widget.mappings.map((mapping) => this.sanitizeMappingEntry(mapping)).filter(Boolean)
      if (!widget.mappings.length) {
        delete widget.mappings
      }
    },
    cleanConfig(widget) {
      this.sanitizeRuleAttributes(widget)
      this.sanitizeMappings(widget)
      for (let key in widget) {
        if (widget[key] && Array.isArray(widget[key])) {
          widget[key] = widget[key].filter(Boolean)
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
      this.setParents(processed)
      const editable = processed.editable ?? true
      this.cleanConfig(processed)
      processed.editable = editable
      return processed
    },
    preProcessWidgetLoad(widget) {
      if (widget.label) {
        const labelMatch = widget.label.match(/^(.*)\s\[(.*?)\]\s*$/)
        if (labelMatch) {
          widget.label = labelMatch[1].trim()
          widget.format = labelMatch[2].trim()
        }
      }
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
      this.cleanConfig(processed)
      return processed
    },
    preProcessWidgetSave(widget) {
      if (widget.format) {
        widget.label = (widget.label || '') + ' [' + widget.format + ']'
      }
      delete widget.format
      delete widget.parent // remove parent from widget, as this would cause a circular reference error when converting to JSON
      widget.widgets?.forEach(this.preProcessWidgetSave)
    },
    update(value) {
      this.sitemap = this.preProcessSitemapLoad(value)
      this.selectRootSitemapWidget()
    },
    startEventSource() {},
    stopEventSource() {},
    duplicateWidget() {
      if (this.selectedWidget.type === 'Sitemap') {
        const sitemapCopy = this.preProcessSitemapSave(this.selectedWidget)
        this.f7router.navigate('/settings/sitemaps/duplicate', { props: { sitemapCopy } })
        return
      }
      const duplicate = cloneDeep(this.selectedWidget)
      const index = this.selectedWidgetParent.widgets.indexOf(this.selectedWidget) + 1
      this.selectedWidgetParent.widgets.splice(index, 0, duplicate)
      this.selectedWidget = this.selectedWidgetParent.widgets[index]
    },
    removeWidget() {
      this.selectedWidgetParent.widgets.splice(this.selectedWidgetParent.widgets.indexOf(this.selectedWidget), 1)
      this.selectedWidget = null
      this.selectedWidgetParent = null
    },
    moveWidgetDown() {
      const widgets = this.selectedWidgetParent.widgets
      const pos = widgets.indexOf(this.selectedWidget)
      if (pos >= widgets.length - 1) return
      widgets.splice(pos, 1)
      widgets.splice(pos + 1, 0, this.selectedWidget)
    },
    moveWidgetUp() {
      const widgets = this.selectedWidgetParent.widgets
      const pos = widgets.indexOf(this.selectedWidget)
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
