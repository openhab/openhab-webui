<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut" class="layout-editor">
    <f7-navbar :title="(!ready) ? '' : (createMode) ? 'Create layout page' : page.config.label" back-link="Back" no-hairline>
      <f7-nav-right>
        <f7-link @click="save()" v-if="$theme.md" icon-md="material:save" icon-only></f7-link>
        <f7-link @click="save()" v-if="!$theme.md">Save<span v-if="$device.desktop">&nbsp;(Ctrl-S)</span></f7-link>
      </f7-nav-right>
    </f7-navbar>
    <f7-toolbar tabbar position="top">
      <f7-link @click="currentTab = 'design'; fromYaml()" :tab-link-active="currentTab === 'design'" class="tab-link">Design</f7-link>
      <f7-link @click="currentTab = 'code'; toYaml()" :tab-link-active="currentTab === 'code'" class="tab-link">Code</f7-link>
    </f7-toolbar>
    <f7-toolbar bottom class="toolbar-details" v-show="currentTab === 'design'">
      <div style="margin-left: auto">
        <f7-toggle :checked="previewMode" @toggle:change="(value) => previewMode = value"></f7-toggle> Run mode<span v-if="$device.desktop">&nbsp;(Ctrl-R)</span>
      </div>
    </f7-toolbar>
    <f7-tabs class="layout-editor-tabs">
      <f7-tab id="design" class="layout-editor-design-tab" @tab:show="() => this.currentTab = 'design'" :tab-active="currentTab === 'design'">
        <f7-block v-if="!ready" class="text-align-center">
          <f7-preloader></f7-preloader>
          <div>Loading...</div>
        </f7-block>
        <f7-block class="block-narrow" v-if="ready && !previewMode">
          <page-settings :page="page" :createMode="createMode" />
        </f7-block>

        <oh-layout-page class="layout-page" v-if="ready" :context="context" :key="pageKey"
          @add-block="addBlock"
          @add-masonry="addMasonry"
        />
      </f7-tab>
      <f7-tab id="code" @tab:show="() => { this.currentTab = 'code' }" :tab-active="currentTab === 'code'">
        <editor v-if="currentTab === 'code'" class="page-code-editor" mode="text/x-yaml" :value="pageYaml" @input="(value) => pageYaml = value" />
        <pre class="yaml-message padding-horizontal" :class="[yamlError === 'OK' ? 'text-color-green' : 'text-color-red']">{{yamlError}}</pre>
      </f7-tab>
    </f7-tabs>

    <widget-config-popup :opened="widgetConfigOpened" :component="currentComponent" :widget="currentWidget" @closed="widgetConfigClosed" @update="updateWidgetConfig" />
    <widget-code-popup :opened="widgetCodeOpened" :component="currentComponent" @closed="widgetCodeClosed" @update="updateWidgetCode" />
    <model-picker-popup :opened="modelPickerOpened" :multiple="modelPickerAllowMultiple" @closed="modelPickerOpened = false" @input="doAddFromModel" action-label="Add" />
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
  height calc(80% - 2*var(--f7-navbar-height))
  width 100%
.yaml-message
  display block
  position absolute
  top 80%
  white-space pre-wrap
.layout-editor-design-tab
  .layout-page
    .oh-masonry
      z-index inherit
      padding-bottom 5rem
.layout-editor
  .page-content
    padding-bottom 5rem
    z-index inherit
</style>

<script>
import PageDesigner from '../pagedesigner-mixin'

import YAML from 'yaml'

import OhLayoutPage from '@/components/widgets/layout/oh-layout-page.vue'
import * as SystemWidgets from '@/components/widgets/system/index'
import * as StandardWidgets from '@/components/widgets/standard/index'
import * as StandardListWidgets from '@/components/widgets/standard/list/index'
import * as LayoutWidgets from '@/components/widgets/layout/index'

import PageSettings from '@/components/pagedesigner/page-settings.vue'
import WidgetConfigPopup from '@/components/pagedesigner/widget-config-popup.vue'
import WidgetCodePopup from '@/components/pagedesigner/widget-code-popup.vue'
import ModelPickerPopup from '@/components/model/model-picker-popup.vue'

import itemDefaultStandaloneComponent from '@/components/widgets/standard/default-standalone-item'
import itemDefaultListComponent from '@/components/widgets/standard/list/default-list-item'

export default {
  mixins: [PageDesigner],
  components: {
    'editor': () => import('@/components/config/controls/script-editor.vue'),
    OhLayoutPage,
    PageSettings,
    WidgetConfigPopup,
    WidgetCodePopup,
    ModelPickerPopup
  },
  props: ['createMode', 'uid'],
  data () {
    return {
      page: {
        uid: 'page_' + this.$f7.utils.id(),
        component: 'oh-layout-page',
        config: {},
        slots: { default: [] }
      },
      addFromModelContext: {},
      modelPickerAllowMultiple: true,
      modelPickerOpened: false
    }
  },
  methods: {
    addWidget (component, widgetType, parentContext, slot) {
      const isList = component.component.indexOf('oh-list') === 0
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
          this.addFromModelContext = { component, slot, isList }
          this.modelPickerAllowMultiple = component.component !== 'oh-grid-col'
          this.modelPickerOpened = true
          this.$nextTick(() => actions.destroy())
        }
        const stdWidgets = (isList) ? StandardListWidgets : StandardWidgets
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
              { label: true, text: (isList) ? 'Standard Library (List)' : 'Standard Library' },
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
      const defaultWidgetFn = (this.addFromModelContext.isList) ? itemDefaultListComponent : itemDefaultStandaloneComponent
      const component = this.addFromModelContext.component
      const slot = this.addFromModelContext.slot
      if (Array.isArray(value)) {
        value.forEach((i) => {
          component.slots[slot].push(defaultWidgetFn(i))
        })
      } else {
        component.slots[slot].push(defaultWidgetFn(value))
      }
      this.addFromModelContext = {}
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
    getWidgetDefinition (componentType) {
      const component = Object.values({ ...SystemWidgets, ...LayoutWidgets, ...StandardWidgets, ...StandardListWidgets })
        .find((w) => w.widget && typeof w.widget === 'function' && w.widget().name === componentType)
      if (!component) return null
      return component.widget()
    },
    toYaml () {
      this.pageYaml = YAML.stringify({
        blocks: this.page.slots.default,
        masonry: this.page.slots.masonry
      })
    },
    fromYaml () {
      try {
        const updatedSlots = YAML.parse(this.pageYaml)
        this.$set(this.page.slots, 'default', updatedSlots.blocks)
        this.$set(this.page.slots, 'masonry', updatedSlots.masonry)
        this.forceUpdate()
        return true
      } catch (e) {
        this.$f7.dialog.alert(e).open()
        return false
      }
    }
  }
}
</script>
