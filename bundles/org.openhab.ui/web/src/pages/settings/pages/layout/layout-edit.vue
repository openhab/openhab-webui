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
    <widget-code-popup :opened="widgetCodeOpened" :component="currentComponent" :widget-yaml="widgetYaml" @closed="widgetCodeClosed" @update="updateWidgetCode" />
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
import * as LayoutWidgets from '@/components/widgets/layout/index'

import PageSettings from '@/components/pagedesigner/page-settings.vue'
import WidgetConfigPopup from '@/components/pagedesigner/widget-config-popup.vue'
import WidgetCodePopup from '@/components/pagedesigner/widget-code-popup.vue'

export default {
  mixins: [PageDesigner],
  components: {
    'editor': () => import('@/components/config/controls/script-editor.vue'),
    OhLayoutPage,
    PageSettings,
    WidgetConfigPopup,
    WidgetCodePopup
  },
  props: ['createMode', 'uid'],
  data () {
    return {
      page: {
        uid: 'page_' + this.$f7.utils.id(),
        component: 'oh-layout-page',
        config: {},
        slots: { default: [] }
      }
    }
  },
  methods: {
    addWidget (component, widgetType, parentContext, slot) {
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
        var doAddWidget = (choice) => {
          component.slots[slot].push({
            component: choice,
            config: {}
          })
          this.$nextTick(() => actions.destroy())
          this.forceUpdate()
        }
        const standardWidgetOptions = Object.keys(StandardWidgets).map((k) => {
          return {
            text: StandardWidgets[k].widget.label,
            color: 'blue',
            onClick: () => doAddWidget(StandardWidgets[k].widget.name)
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
              { label: true, text: 'Standard Library' },
              ...standardWidgetOptions
            ],
            [
              { label: true, text: 'Personal Widgets' },
              ...customWidgetOptions
            ],
            [
              { color: 'red', 'text': 'Cancel', close: true }
            ]
          ]
        }).open()
      }
    },
    addBlock (component) {
      component.slots.default.push({
        component: 'oh-block',
        config: {},
        slots: { default: [] }
      })
    },
    addMasonry (component) {
      if (!component.slots.masonry) {
        this.$set(this.page.slots, 'masonry', [{
          component: 'oh-masonry',
          config: { nbTestCards: 10 },
          slots: { default: [] }
        }])
      }
    },
    getWidgetDefinition (componentType) {
      const component = Object.values({ ...SystemWidgets, ...LayoutWidgets, ...StandardWidgets }).find((w) => w.widget && w.widget.name === componentType)
      if (!component) return null
      return component.widget
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
