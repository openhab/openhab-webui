<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut" class="layout-editor">
    <f7-navbar v-if="!(previewMode && page.config.hideNavbar) && !fullscreen" :title="(!ready) ? '' : (createMode) ? 'Create layout page' : page.config.label" back-link="Back" no-hairline>
      <f7-nav-right>
        <f7-link @click="save()" v-if="$theme.md" icon-md="material:save" icon-only></f7-link>
        <f7-link @click="save()" v-if="!$theme.md">Save<span v-if="$device.desktop">&nbsp;(Ctrl-S)</span></f7-link>
      </f7-nav-right>
    </f7-navbar>
    <f7-toolbar v-if="!previewMode && !fullscreen" tabbar position="top">
      <f7-link @click="currentTab = 'design'; fromYaml()" :tab-link-active="currentTab === 'design'" class="tab-link">Design</f7-link>
      <f7-link @click="currentTab = 'code'; toYaml()" :tab-link-active="currentTab === 'code'" class="tab-link">Code</f7-link>
    </f7-toolbar>
    <f7-toolbar v-if="!fullscreen" bottom class="toolbar-details">
      <f7-link v-if="$fullscreen.support" class="fullscreen-link" icon-f7="rectangle_arrow_up_right_arrow_down_left" text="Fullscreen" color="blue" @click="toggleFullscreen" />
      <div style="margin-left: auto">
        <f7-toggle :checked="previewMode" @toggle:change="(value) => togglePreviewMode(value)"></f7-toggle> Run mode<span v-if="$device.desktop">&nbsp;(Ctrl-R)</span>
      </div>
    </f7-toolbar>
    <f7-tabs class="layout-editor-tabs">
      <f7-tab id="design" class="layout-editor-design-tab" @tab:show="() => this.currentTab = 'design'" :tab-active="currentTab === 'design'">
        <f7-block v-if="!ready" class="text-align-center">
          <f7-preloader></f7-preloader>
          <div>Loading...</div>
        </f7-block>
        <f7-block id="page-settings" class="block-narrow" v-if="ready && !(previewMode || fullscreen)">
          <page-settings :page="page" :createMode="createMode" />
        </f7-block>

        <f7-block v-if="ready &&
                    !(context.component.slots.default && context.component.slots.default.length) &&
                    !(context.component.slots.masonry && context.component.slots.masonry.length) &&
                    !(context.component.slots.grid && context.component.slots.grid.length) &&
                    !['responsive', 'fixed'].includes(page.config.layoutType)"
                  class="block-narrow margin-bottom" inset>
          <f7-block-title class="margin text-align-center">Choose a layout style</f7-block-title>
          <f7-row class="text-align-center align-items-stretch">
            <f7-col width="50" class="elevation-2 elevation-hover-6 elevation-pressed-1" style="background-color: var(--f7-card-bg-color)">
              <f7-link @click="setLayoutType('responsive')" class="flex-direction-column padding" style="color: var(--f7-theme-color-text-color)">
                <f7-icon size="70px" f7="rectangle_3_offgrid"></f7-icon>
                <div class="margin-bottom">Responsive</div>
                <div class="margin-top">Create a page that automatically adjusts to the size of the screen. Suitable for use with any device.</div>
              </f7-link>
            </f7-col>
            <f7-col width="50" class="elevation-2 elevation-hover-6 elevation-pressed-1" style="background-color: var(--f7-card-bg-color)">
              <f7-link @click="setLayoutType('fixed')" class="flex-direction-column padding" style="color: var(--f7-theme-color-text-color)">
                <f7-icon size="70px" f7="grid"></f7-icon>
                <div class="margin-bottom">Fixed Grid</div>
                <div class="margin-top">Create a panel-like page for a specific screen size. Suitable for e.g. wall mounted tablets.</div>
              </f7-link>
            </f7-col>
          </f7-row>
        </f7-block>

        <oh-layout-page class="layout-page" v-else-if="ready" :context="context" :key="pageKey"
                        @add-block="addBlock"
                        @add-masonry="addMasonry"
                        @add-grid-item="addGridItem"
        />
      </f7-tab>
      <f7-tab id="code" @tab:show="() => { this.currentTab = 'code' }" :tab-active="currentTab === 'code'">
        <editor v-if="currentTab === 'code'" :style="{ opacity: previewMode ? '0' : '' }" class="page-code-editor" mode="application/vnd.openhab.uicomponent+yaml?type=layout" :value="pageYaml" @input="onEditorInput" />
        <!-- <pre class="yaml-message padding-horizontal" :class="[yamlError === 'OK' ? 'text-color-green' : 'text-color-red']">{{yamlError}}</pre> -->

        <oh-layout-page class="layout-page" v-if="ready && previewMode" :context="context" :key="pageKey" />
      </f7-tab>
    </f7-tabs>
  </f7-page>
</template>

<style lang="stylus">
.sitemap-editor-tabs
  --f7-grid-gap 0px
  height calc(100% - var(--f7-toolbar-height))
  .tab
    height 100%
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
.layout-editor-design-tab
  .layout-page
    margin-bottom calc(var(--f7-toolbar-height) + 1rem)
    .oh-masonry
      z-index inherit
.layout-editor
  .page-content
    z-index inherit
  .toolbar-details
    .tab-link-highlight
      display none
</style>

<script>
import PageDesigner from '../pagedesigner-mixin'

import YAML from 'yaml'

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
  mixins: [PageDesigner],
  components: {
    'editor': () => import('@/components/config/controls/script-editor.vue'),
    OhLayoutPage,
    PageSettings
  },
  props: ['createMode', 'uid'],
  data () {
    return {
      page: {
        uid: 'page_' + this.$f7.utils.id(),
        component: 'oh-layout-page',
        config: {},
        slots: {
          default: [],
          grid: []
        }
      },
      addFromModelContext: {},
      modelPickerAllowMultiple: true,
      modelPickerOpened: false,
      fullscreen: this.$fullscreen.getState()
    }
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
        const standardWidgetOptions = Object.keys(stdWidgets).map((k) => {
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
        })
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
    setLayoutType (layoutType) {
      this.page.config.layoutType = layoutType
      if (layoutType === 'responsive') {
        this.page.slots.default = []
      } else {
        this.page.slots.grid = []
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
          slots: { default: [] }
        }])
      }
    },
    addGridItem (component) {
      component.slots['grid'].push({
        component: 'oh-grid-item',
        config: { x: 5, y: 3, h: 2, w: 2 },
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
        blocks: this.page.slots.default,
        masonry: this.page.slots.masonry,
        grid: this.page.slots.grid
      })
    },
    fromYaml () {
      try {
        const updatedPage = YAML.parse(this.pageYaml)
        if (updatedPage.config && updatedPage.config.layoutType && updatedPage.config.layoutType === 'fixed' &&
           ((updatedPage.blocks && updatedPage.blocks.length) || (updatedPage.masonry && updatedPage.masonry.length))) {
          throw new Error('Using blocks and masonry in fixed-size layouts is not possible')
        }

        this.$set(this.page, 'config', updatedPage.config)
        this.$set(this.page.slots, 'default', updatedPage.blocks)
        this.$set(this.page.slots, 'masonry', updatedPage.masonry)
        this.$set(this.page.slots, 'grid', updatedPage.grid)
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
    }
  }
}
</script>
