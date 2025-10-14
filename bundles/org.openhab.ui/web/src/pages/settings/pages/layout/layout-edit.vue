<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut" class="layout-editor">
    <f7-navbar
      v-if="!(previewMode && page.config.hideNavbar) && !fullscreen"
      :title="!ready ? '' : ((createMode ? 'Create layout page' : page.config.label) + dirtyIndicator)"
      back-link="Back"
      no-hairline>
      <f7-nav-right>
        <f7-link @click="save()"
                 v-if="$theme.md"
                 icon-md="material:save"
                 icon-only />
        <f7-link @click="save()" v-if="!$theme.md">
          Save<span v-if="$device.desktop">&nbsp;(Ctrl-S)</span>
        </f7-link>
      </f7-nav-right>
    </f7-navbar>
    <f7-toolbar v-if="!previewMode && !fullscreen" tabbar position="top">
      <f7-link @click="switchTab('design', fromYaml)" :tab-link-active="currentTab === 'design'" class="tab-link">
        Design
      </f7-link>
      <f7-link @click="switchTab('code', toYaml)" :tab-link-active="currentTab === 'code'" class="tab-link">
        Code
      </f7-link>
    </f7-toolbar>
    <f7-toolbar v-if="!fullscreen" bottom class="toolbar-details">
      <f7-link v-if="$fullscreen.isEnabled"
               class="fullscreen-link"
               icon-f7="rectangle_arrow_up_right_arrow_down_left"
               text="Fullscreen"
               color="blue"
               @click="toggleFullscreen" />
      <div class="display-flex flex-direction-row align-items-center">
        <f7-toggle :checked="previewMode ? true : null" @toggle:change="(value) => togglePreviewMode(value)" />&nbsp;Run mode<span v-if="$device.desktop">&nbsp;(Ctrl-R)</span>
        <f7-link v-if="!createMode"
                 class="right margin-left padding-right"
                 @click="detailsOpened = true"
                 icon-f7="chevron_up" />
      </div>
    </f7-toolbar>
    <f7-tabs class="layout-editor-tabs">
      <f7-tab id="design"
              class="layout-editor-design-tab"
              @tab:show="() => this.currentTab = 'design'"
              :tab-active="currentTab === 'design'">
        <f7-block v-if="!ready" class="text-align-center">
          <f7-preloader />
          <div>Loading...</div>
        </f7-block>
        <f7-block id="page-settings" class="block-narrow" v-if="ready && createMode && !(previewMode || fullscreen)">
          <page-settings :page="page" :createMode="createMode" />
          <f7-col>
            <f7-block-footer class="padding-horizontal margin-bottom">
              Note: After saving this page, you can view the page settings by clicking the chevron
              up icon (<f7-icon color="blue" f7="chevron_up" />) at the bottom right corner of the
              screen, next to "Run mode"
            </f7-block-footer>
          </f7-col>
        </f7-block>

        <f7-block v-if="ready &&
                    !(context.component.slots.default && context.component.slots.default.length) &&
                    !(context.component.slots.masonry && context.component.slots.masonry.length) &&
                    !(context.component.slots.grid && context.component.slots.grid.length) &&
                    !(context.component.slots.canvas && context.component.slots.canvas.length) &&
                    page.uid !== 'overview' &&
                    !['responsive', 'fixed'].includes(page.config.layoutType)"
                  class="block-narrow no-padding">
          <f7-col>
            <f7-list accordion-list>
              <f7-block-title class="margin-left">
                Layout Type
              </f7-block-title>
              <f7-list-item accordion-item title="Switch to Fixed Layout">
                <f7-accordion-content>
                  <f7-block class="margin text-align-center">
                    Switch to a fixed layout type, suitable for e.g. wall mounted tablets:
                  </f7-block>
                  <f7-row class="text-align-center align-items-stretch margin-vertical" no-gap>
                    <f7-col width="50">
                      <f7-link @click="setLayoutType('fixed', 'grid')"
                               class="flex-direction-column padding margin-left-half elevation-1 elevation-hover-3"
                               style="color: var(--f7-theme-color-text-color)">
                        <f7-icon size="70px" f7="grid" />
                        <div class="margin-bottom">
                          Fixed Grid
                        </div>
                        <f7-block-footer class="margin-top">
                          <small>Position and resize widgets on a grid with fixed dimensions.</small>
                        </f7-block-footer>
                      </f7-link>
                    </f7-col>
                    <f7-col width="50">
                      <f7-link @click="setLayoutType('fixed', 'canvas')"
                               class="flex-direction-column padding margin-right-half elevation-1 elevation-hover-3"
                               style="color: var(--f7-theme-color-text-color)">
                        <f7-icon size="70px" f7="rectangle_3_offgrid" />
                        <div class="margin-bottom">
                          Fixed Canvas
                        </div>
                        <f7-block-footer class="margin-top">
                          <small>Position and resize widgets freely over a fixed background.</small>
                        </f7-block-footer>
                      </f7-link>
                    </f7-col>
                  </f7-row>
                </f7-accordion-content>
              </f7-list-item>
            </f7-list>
          </f7-col>
        </f7-block>

        <oh-layout-page v-if="ready"
                        class="layout-page"
                        :context="context"
                        :key="pageKey"
                        :style="page.config.style"
                        @action="performAction($event.ev, $event.prefix, $event.config, $event.context)"
                        @add-block="addBlock"
                        @add-masonry="addMasonry"
                        @add-grid-item="addGridItem"
                        @add-canvas-item="addCanvasItem" />

        <f7-sheet ref="detailsSheet"
                  :backdrop="false"
                  :close-on-escape="true"
                  :opened="detailsOpened"
                  @sheet:closed="detailsOpened = false">
          <f7-page>
            <f7-toolbar tabbar bottom>
              <span class="margin-left">Page Settings</span>
              <div class="right">
                <f7-link sheet-close class="padding-right">
                  <f7-icon f7="chevron_down" />
                </f7-link>
              </div>
            </f7-toolbar>
            <f7-block class="block-narrow">
              <page-settings :page="page" :createMode="createMode" />
            </f7-block>
          </f7-page>
        </f7-sheet>
      </f7-tab>
      <f7-tab id="code" @tab:show="() => { this.currentTab = 'code' }" :tab-active="currentTab === 'code'">
        <editor v-if="currentTab === 'code'"
                :style="{ opacity: previewMode ? '0' : '' }"
                class="page-code-editor"
                mode="application/vnd.openhab.uicomponent+yaml?type=layout"
                :value="pageYaml"
                @input="onEditorInput" />
        <!-- <pre class="yaml-message padding-horizontal" :class="[yamlError === 'OK' ? 'text-color-green' : 'text-color-red']">{{yamlError}}</pre> -->

        <oh-layout-page v-if="ready && previewMode"
                        class="layout-page"
                        :context="context"
                        :key="pageKey"
                        :style="page.config.style"
                        @action="performAction($event.ev, $event.prefix, $event.config, $event.context)" />
      </f7-tab>
    </f7-tabs>
  </f7-page>
</template>

<style lang="stylus">
.layout-editor
  .page-content
    z-index inherit
  .toolbar-details
    .tab-link-highlight
      display none
  .layout-editor-tabs
    --f7-grid-gap 0px
    height calc(100% - var(--f7-toolbar-height))
    .tab
      height 100%
    .layout-editor-design-tab
      .layout-page
        margin-bottom calc(var(--f7-toolbar-height) + 1rem)
        .oh-masonry
          z-index inherit
  .page-code-editor.vue-codemirror
    display block
    top calc(var(--f7-navbar-height) + var(--f7-tabbar-height))
    height calc(100% - 3*var(--f7-navbar-height))
    width 100%
  .yaml-message
    display block
    position absolute
    top 80%
    white-space pre-wrap
</style>

<script>
import YAML from 'yaml'

import PageDesigner from '../pagedesigner-mixin'
import { actionsMixin } from '@/components/widgets/widget-actions'

import OhLayoutPage from '@/components/widgets/layout/oh-layout-page.vue'
import * as SystemWidgets from '@/components/widgets/system'
import * as StandardWidgets from '@/components/widgets/standard'
import * as StandardListWidgets from '@/components/widgets/standard/list'
import * as StandardCellWidgets from '@/components/widgets/standard/cell'
import * as LayoutWidgets from '@/components/widgets/layout'

import PageSettings from '@/components/pagedesigner/page-settings.vue'
import ModelPickerPopup from '@/components/model/model-picker-popup.vue'

import itemDefaultStandaloneComponent from '@/components/widgets/standard/default-standalone-item'
import itemDefaultListComponent from '@/components/widgets/standard/list/default-list-item'
import itemDefaultCellComponent from '@/components/widgets/standard/cell/default-cell-item'

import { compareItems } from '@/components/widgets/widget-order'

export default {
  mixins: [PageDesigner, actionsMixin],
  components: {
    'editor': () => import(/* webpackChunkName: "script-editor" */ '@/components/config/controls/script-editor.vue'),
    OhLayoutPage,
    PageSettings
  },
  props: {
    createMode: Boolean,
    uid: String,
    f7router: Object
  },
  data () {
    return {
      page: {
        uid: 'page_' + this.$f7.utils.id(),
        component: 'oh-layout-page',
        config: {},
        tags: [],
        slots: {
          default: [],
          masonry: [],
          grid: [],
          canvas: []
        }
      },
      addFromModelContext: {},
      detailsOpened: false,
      modelPickerAllowMultiple: true,
      modelPickerOpened: false,
      fullscreen: this.$fullscreen.getState()
    }
  },
  created () {
    this.$f7.on('svgOnClickConfigUpdate', this.onSvgOnClickConfigUpdate)
  },
  beforeDestroy () {
    this.$f7.off('svgOnClickConfigUpdate', this.onSvgOnClickConfigUpdate)
  },
  methods: {
    addWidget (component, widgetType, parentContext, slot) {
      const isList = component.component.indexOf('oh-list') === 0
      const isCells = component.component.indexOf('oh-grid-cells') === 0
      if (!slot) slot = 'default'
      if (!component.slots) component.slots = {}
      if (!component.slots[slot]) component.slots[slot] = []
      if (widgetType) {
        component.slots[slot].push({
          component: widgetType,
          config: {},
          slots: { default: [] }
        })
        this.forceUpdate()
      } else {
        let actions
        const doAddWidget = (choice) => {
          component.slots[slot].push({
            component: choice,
            config: {}
          })
          this.$nextTick(() => actions.destroy())
          this.forceUpdate()
        }
        const addFromModel = () => {
          this.addFromModelContext = { component, slot, isList, isCells }
          this.modelPickerAllowMultiple = component.component !== 'oh-grid-col'
          const popup = {
            component: ModelPickerPopup
          }

          this.$f7router.navigate({
            url: 'pick-from-model',
            route: {
              path: 'pick-from-model',
              popup
            }
          }, {
            props: {
              multiple: this.modelPickerAllowMultiple,
              popupTitle: 'Add from Model'
            }
          })

          this.$f7.once('itemsPicked', this.doAddFromModel)
          this.$f7.once('modelPickerClosed', () => {
            this.$f7.off('itemsPicked', this.doAddFromModel)
          })

          this.$nextTick(() => actions.destroy())
        }
        const stdWidgets = (isList) ? StandardListWidgets : (isCells) ? StandardCellWidgets : StandardWidgets
        const standardWidgetOptions = Object.keys(stdWidgets).filter((k) => !stdWidgets[k].widget().hidden).map((k) => {
          return {
            text: stdWidgets[k].widget().label,
            color: 'blue',
            onClick: () => doAddWidget(stdWidgets[k].widget().name)
          }
        })
        const customWidgetOptions = this.$store.state.components.widgets.map((w) => {
          return {
            text: w.uid,
            color: 'blue',
            onClick: () => doAddWidget('widget:' + w.uid)
          }
        }).sort((a, b) => a.text.localeCompare(b.text))
        actions = this.$f7.actions.create({
          // grid: true,
          buttons: [
            [
              {
                label: true,
                text: (isList)
                  ? 'Standard Library (List)'
                  : (isCells)
                    ? 'Standard Library (Cells)'
                    : 'Standard Library'
              },
              ...standardWidgetOptions
            ],
            [
              { label: true, text: 'Personal Widgets' },
              ...customWidgetOptions
            ],
            [
              {
                color: 'blue',
                text: 'Add from Model...',
                onClick: addFromModel
              }
            ],
            [
              { color: 'red', 'text': 'Cancel', close: true }
            ]
          ]
        }).open()
      }
    },
    doAddFromModel (value) {
      const defaultWidgetFn = (this.addFromModelContext.isList)
        ? itemDefaultListComponent
        : (this.addFromModelContext.isCells)
          ? itemDefaultCellComponent
          : itemDefaultStandaloneComponent
      const component = this.addFromModelContext.component
      const slot = this.addFromModelContext.slot
      if (Array.isArray(value)) {
        value.sort(compareItems).forEach((i) => {
          component.slots[slot].push(defaultWidgetFn(i))
        })
      } else {
        component.slots[slot].push(defaultWidgetFn(value))
      }
      this.addFromModelContext = {}
      this.forceUpdate()
    },
    setLayoutType (layoutType, fixedType) {
      this.page.config.layoutType = layoutType
      this.page.config.fixedType = fixedType
      if (layoutType === 'responsive') {
        this.page.slots.default = []
      } else if (layoutType === 'fixed' && fixedType === 'grid') {
        this.page.slots.grid = []
      } else if (layoutType === 'fixed' && fixedType === 'canvas') {
        this.page.slots.canvas = []
      }
      this.forceUpdate()
    },
    addBlock (component) {
      component.slots.default.push({
        component: 'oh-block',
        config: {},
        slots: { default: [] }
      })
    },
    addMasonry (component) {
      if (!component.slots.masonry || !component.slots.masonry.length) {
        this.$set(this.page.slots, 'masonry', [{
          component: 'oh-masonry',
          config: {},
          slots: { default: [] }
        }])
      }
    },
    addGridItem (component) {
      component.slots['grid'].push({
        component: 'oh-grid-item',
        config: { x: 5, y: 3, h: 2, w: 2 }
      })
    },
    addCanvasItem (component) {
      component.slots['canvas'].push({
        component: 'oh-canvas-item',
        config: { x: 10, y: 10, h: 50, w: 50 },
        slots: { default: [] }
      })
      this.forceUpdate()
    },
    getWidgetDefinition (componentType) {
      const component = Object.values({ ...SystemWidgets, ...LayoutWidgets, ...StandardWidgets, ...StandardListWidgets, ...StandardCellWidgets })
        .find((w) => w.widget && typeof w.widget === 'function' && w.widget().name === componentType)
      if (!component) return null
      return component.widget()
    },
    toYaml () {
      this.pageYaml = YAML.stringify({
        config: this.page.config,
        // make sure array is available for existing pages, where the prop might be undefined, by falling back to empty array
        blocks: this.page.slots.default || [],
        masonry: this.page.slots.masonry || [],
        grid: this.page.slots.grid || [],
        canvas: this.page.slots.canvas || []
      })
    },
    fromYaml () {
      try {
        const updatedPage = YAML.parse(this.pageYaml)
        if (updatedPage.config && updatedPage.config.layoutType &&
            updatedPage.config.layoutType === 'fixed' &&
           ((updatedPage.blocks && updatedPage.blocks.length) || (updatedPage.masonry && updatedPage.masonry.length))) {
          throw new Error('Using blocks and masonry in fixed layouts is not possible')
        }

        this.$set(this.page, 'config', updatedPage.config)
        this.$set(this.page.slots, 'default', updatedPage.blocks)
        this.$set(this.page.slots, 'masonry', updatedPage.masonry)
        this.$set(this.page.slots, 'grid', updatedPage.grid)
        this.$set(this.page.slots, 'canvas', updatedPage.canvas)
        this.forceUpdate()
        return true
      } catch (e) {
        this.$f7.dialog.alert(e).open()
        return false
      }
    },
    toggleFullscreen () {
      this.$fullscreen.toggle(document.body, {
        wrap: false,
        callback: (fullscreen) => {
          this.fullscreen = fullscreen
          if (fullscreen) {
            this.$f7.panel.get('left').disableVisibleBreakpoint()
          } else {
            if (localStorage.getItem('openhab.ui:panel.visibleBreakpointDisabled') !== 'true') {
              this.$f7.panel.get('left').enableVisibleBreakpoint()
            }
          }
          this.forceUpdate()
        }
      })
    },
    onPageBeforeOut () {
      this.$refs.detailsSheet.f7Sheet.close()
    },
    onSvgOnClickConfigUpdate (event) {
      if (!this.page.config.embeddedSvgActions) {
        this.$set(this.page.config, 'embeddedSvgActions', {})
      }
      this.page.config.embeddedSvgActions[event.id] = event.config
    }
  }
}
</script>
