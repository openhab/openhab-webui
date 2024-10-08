<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut" class="chart-editor">
    <f7-navbar :title="(createMode ? 'Create chart page' : page.config.label) + dirtyIndicator" back-link="Back" no-hairline>
      <f7-nav-right>
        <f7-link @click="save()" v-if="$theme.md" icon-md="material:save" icon-only />
        <f7-link @click="save()" v-if="!$theme.md">
          Save<span v-if="$device.desktop">&nbsp;(Ctrl-S)</span>
        </f7-link>
      </f7-nav-right>
    </f7-navbar>
    <f7-toolbar tabbar position="top">
      <f7-link @click="switchTab('design', fromYaml)" :tab-link-active="currentTab === 'design'" class="tab-link">
        Design
      </f7-link>
      <f7-link @click="switchTab('code', toYaml)" :tab-link-active="currentTab === 'code'" class="tab-link">
        Code
      </f7-link>
    </f7-toolbar>
    <f7-toolbar bottom class="toolbar-details">
      <div style="margin-left: auto">
        <f7-toggle :checked="previewMode" @toggle:change="(value) => togglePreviewMode(value)" /> Run mode<span v-if="$device.desktop">&nbsp;(Ctrl-R)</span>
      </div>
    </f7-toolbar>
    <f7-tabs class="chart-editor-tabs">
      <f7-tab id="design" class="chart-editor-design-tab" @tab:show="() => this.currentTab = 'design'" :tab-active="currentTab === 'design'">
        <f7-block v-if="!ready" class="text-align-center">
          <f7-preloader />
          <div>Loading...</div>
        </f7-block>
        <f7-block class="block-narrow" v-if="ready && !previewMode">
          <page-settings :page="page" :createMode="createMode" />
          <f7-block-title>Chart Configuration</f7-block-title>
          <config-sheet
            :parameterGroups="pageWidgetDefinition.props.parameterGroups || []"
            :parameters="pageWidgetDefinition.props.parameters || []"
            :configuration="page.config" />
        </f7-block>

        <chart-designer class="chart-designer" v-if="ready && !previewMode && currentTab === 'design'" :context="context" />

        <oh-chart-page class="chart-page" v-else-if="ready && previewMode && currentTab === 'design'" :context="context" :key="pageKey" />
      </f7-tab>

      <f7-tab id="code" @tab:show="() => { this.currentTab = 'code' }" :tab-active="currentTab === 'code'">
        <editor v-if="currentTab === 'code'" :style="{ opacity: previewMode ? '0' : '' }" class="page-code-editor" mode="application/vnd.openhab.uicomponent+yaml;type=chart" :value="pageYaml" @input="onEditorInput" />
        <!-- <pre v-show="!previewMode" class="yaml-message padding-horizontal" :class="[yamlError === 'OK' ? 'text-color-green' : 'text-color-red']">{{yamlError}}</pre> -->

        <oh-chart-page class="chart-page" v-if="ready && previewMode" :context="context" :key="pageKey" />
      </f7-tab>
    </f7-tabs>
  </f7-page>
</template>

<style lang="stylus">
.chart-editor
  .oh-chart-page-chart
    top calc(var(--f7-navbar-height) + var(--f7-toolbar-height)) !important
    height calc(100% - var(--f7-navbar-height) - 2 * var(--f7-toolbar-height)) !important
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
  .code-editor-docs-link
    position absolute
    top calc(80% - var(--f7-navbar-height))
    width 100%
</style>

<script>
import PageDesigner from '../pagedesigner-mixin'

import YAML from 'yaml'

import OhChartPage from '@/components/widgets/chart/oh-chart-page.vue'

import PageSettings from '@/components/pagedesigner/page-settings.vue'

import ChartDesigner from '@/components/pagedesigner/chart/chart-designer.vue'
import ChartWidgetsDefinitions from '@/assets/definitions/widgets/chart/index'

import ConfigSheet from '@/components/config/config-sheet.vue'

import WidgetSlotConfigPopup from '@/components/pagedesigner/widget-slot-config-popup.vue'

export default {
  mixins: [PageDesigner],
  components: {
    'editor': () => import(/* webpackChunkName: "script-editor" */ '@/components/config/controls/script-editor.vue'),
    OhChartPage,
    PageSettings,
    ChartDesigner,
    ConfigSheet
  },
  props: ['createMode', 'uid'],
  data () {
    return {
      pageWidgetDefinition: OhChartPage.widget(),
      page: {
        uid: 'page_' + this.$f7.utils.id(),
        component: 'oh-chart-page',
        config: {},
        tags: [],
        slots: { grid: [], xAxis: [], yAxis: [], series: [] }
      },
      currentSlot: null,
      currentSlotParent: null,
      currentSlotConfig: null,
      currentSlotDefaultComponentType: null,
      widgetSlotConfigOpened: false
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
      }
    },
    widgetConfigClosed () {
      this.currentComponent = null
      this.currentWidget = null
      this.currentSlot = null
      this.currentSlotParent = null
      this.currentSlotConfig = null
      this.widgetConfigOpened = false
      this.widgetSlotConfigOpened = false
    },
    updateWidgetSlotConfig () {
      this.$set(this.currentSlotParent.slots, this.currentSlot, this.currentSlotConfig)
      this.forceUpdate()
      this.widgetConfigClosed()
    },
    getWidgetDefinition (componentType) {
      return ChartWidgetsDefinitions[componentType]
    },
    configureSlot (component, slotName, defaultSlotComponentType) {
      this.currentSlotParent = component
      this.currentWidget = null
      this.currentSlot = slotName
      this.currentSlotDefaultComponentType = defaultSlotComponentType
      if (this.currentSlotParent.slots[slotName] && this.currentSlotParent.slots[slotName].length > 0) {
        this.currentSlotConfig = JSON.parse(JSON.stringify(this.currentSlotParent.slots[slotName]))
      } else {
        this.$set(this, 'currentSlotConfig', [
          {
            component: defaultSlotComponentType,
            config: {
              show: true
            }
          }
        ])
      }

      const popup = {
        component: WidgetSlotConfigPopup
      }

      this.$f7router.navigate({
        url: 'configure-slot',
        route: {
          path: 'configure-slot',
          popup
        }
      }, {
        props: {
          currentSlot: this.currentSlot,
          slotConfig: this.currentSlotConfig,
          getWidgetDefinition: this.getWidgetDefinition,
          removeComponentFromSlot: this.removeComponentFromSlot,
          editWidgetCode: this.editWidgetCode,
          currentSlotDefaultComponentType: this.currentSlotDefaultComponentType,
          initialConfig: { show: true }
        }
      })

      this.$f7.once('widgetSlotConfigUpdate', this.updateWidgetSlotConfig)
      this.$f7.once('widgetSlotConfigClosed', () => {
        this.$f7.off('widgetSlotConfigUpdate', this.updateWidgetSlotConfig)
        this.widgetConfigClosed()
      })
    },
    removeComponentFromSlot (component, slot) {
      slot.splice(slot.indexOf(component), 1)
      if (this.widgetSlotConfigOpened && slot.length === 0) {
        this.$set(this.currentSlotParent.slots, this.currentSlot, undefined)
        delete this.currentSlotParent.slots[this.currentSlot]
        this.widgetConfigClosed()
      }
      this.forceUpdate()
    },
    toYaml () {
      this.pageYaml = YAML.stringify({
        config: this.page.config,
        slots: this.page.slots
      })
    },
    fromYaml () {
      try {
        const updatedPage = YAML.parse(this.pageYaml)
        this.$set(this.page, 'config', updatedPage.config)
        this.$set(this.page, 'slots', updatedPage.slots)
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
