<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut" class="map-editor">
    <f7-navbar no-hairline>
      <oh-nav-content :title="!ready ? '' : ((createMode ? 'Create map page' : page.config.label) + dirtyIndicator)"
                      :save-link="`Save${$device.desktop ? ' (Ctrl-S)' : ''}`"
                      @save="save()"
                      :f7router />
    </f7-navbar>
    <f7-toolbar tabbar position="top">
      <f7-link @click="switchTab('design', fromYaml)" :tab-link-active="currentTab === 'design'" tab-link="#design">
        Design
      </f7-link>
      <f7-link @click="switchTab('code', toYaml)" :tab-link-active="currentTab === 'code'" tab-link="#code">
        Code
      </f7-link>
    </f7-toolbar>
    <f7-toolbar bottom class="toolbar-details">
      <div style="margin-left: auto">
        <f7-toggle :checked="previewMode ? true : null" @toggle:change="value => togglePreviewMode(value)" />
        Run mode<span v-if="$device.desktop">&nbsp;(Ctrl-R)</span>
      </div>
    </f7-toolbar>

    <f7-tabs class="map-editor-tabs">
      <f7-tab id="design"
              class="map-editor-design-tab"
              :tab-active="currentTab === 'design'">
        <f7-block v-if="!ready" class="text-align-center">
          <f7-preloader />
          <div>Loading...</div>
        </f7-block>
        <f7-block class="block-narrow" v-if="ready && !previewMode">
          <page-settings :page="page" :createMode="createMode" :f7router />
        </f7-block>

        <f7-block class="block-narrow" style="padding-bottom: 8rem" v-if="ready && !previewMode">
          <f7-col>
            <f7-block-title>Page Configuration</f7-block-title>
            <config-sheet
              :parameterGroups="pageWidgetDefinition.props.parameterGroups || []"
              :parameters="pageWidgetDefinition.props.parameters || []"
              :configuration="page.config"
              :f7router
              @updated="dirty = true" />

            <f7-block-title>Markers</f7-block-title>
            <f7-menu v-if="clipboardType === 'oh-map-marker'">
              <f7-menu-item style="margin-left: auto" icon-f7="map" dropdown>
                <f7-menu-dropdown right>
                  <f7-menu-dropdown-item @click="pasteWidget(page, null)" href="#" text="Paste" />
                </f7-menu-dropdown>
              </f7-menu-item>
            </f7-menu>

            <f7-list media-list class="markers-list">
              <f7-list-item v-for="(marker, idx) in page.slots.default"
                            media-item
                            :key="idx"
                            :title="marker.config.label"
                            :subtitle="marker.config.item || marker.config.location"
                            link="#"
                            @click="(ev) => configureMarker(ev, marker, context)">
                <template #media>
                  <oh-icon v-if="marker.config.icon && marker.config.icon.indexOf('oh:') === 0"
                           :icon="marker.config.icon.substring(3)"
                           height="32"
                           width="32" />
                  <f7-icon v-else :f7="markerDefaultIcon(marker)" :size="32" />
                </template>
                <template #content-start>
                  <f7-menu class="configure-layout-menu">
                    <f7-menu-item icon-f7="list_bullet" dropdown>
                      <f7-menu-dropdown>
                        <f7-menu-dropdown-item @click="configureWidget(marker, { component: page })" href="#" text="Configure marker" />
                        <f7-menu-dropdown-item @click="editWidgetCode(marker, { component: page })" href="#" text="Edit YAML" />
                        <f7-menu-dropdown-item divider />
                        <f7-menu-dropdown-item @click="cutWidget(marker, { component: page })" href="#" text="Cut" />
                        <f7-menu-dropdown-item @click="copyWidget(marker, { component: page })" href="#" text="Copy" />
                        <f7-menu-dropdown-item divider />
                        <f7-menu-dropdown-item @click="moveWidgetUp(marker, { component: page })" href="#" text="Move Up" />
                        <f7-menu-dropdown-item @click="moveWidgetDown(marker, { component: page })" href="#" text="Move Down" />
                        <f7-menu-dropdown-item divider />
                        <f7-menu-dropdown-item @click="removeWidget(marker, { component: page })" href="#" text="Remove marker" />
                      </f7-menu-dropdown>
                    </f7-menu-item>
                  </f7-menu>
                </template>
              </f7-list-item>
              <f7-list-button color="blue" title="Add marker" @click="addWidget(page, 'oh-map-marker')" />
              <f7-list-button color="blue" title="Add circle marker" @click="addWidget(page, 'oh-map-circle-marker')" />
            </f7-list>
          </f7-col>
        </f7-block>

        <oh-map-page v-else-if="ready && previewMode"
                     class="map-page"
                     :context="context"
                     :key="pageKey" />
      </f7-tab>

      <f7-tab id="code" :tab-active="currentTab === 'code'">
        <editor v-if="currentTab === 'code'"
                :style="{ opacity: previewMode ? '0' : '' }"
                class="page-code-editor"
                mode="application/vnd.openhab.uicomponent+yaml;type=map"
                :value="pageYaml"
                @input="onEditorInput" />
        <!-- <pre class="yaml-message padding-horizontal" :class="[yamlError === 'OK' ? 'text-color-green' : 'text-color-red']">{{yamlError}}</pre> -->

        <oh-map-page v-if="ready && previewMode"
                     class="map-page"
                     :context="context"
                     :key="pageKey + '2'" />
      </f7-tab>
    </f7-tabs>
  </f7-page>
</template>

<style lang="stylus">
.map-editor
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
  .map-editor
    .oh-map-page-lmap
      top calc(var(--f7-navbar-height) + var(--f7-toolbar-height)) !important
      height calc(100% - var(--f7-navbar-height) - 2 * var(--f7-toolbar-height)) !important
  .markers-list
    .item-link
      overflow inherit
      z-index inherit !important
</style>

<script>
import { defineAsyncComponent, provide } from 'vue'
import { f7, theme } from 'framework7-vue'

import PageDesigner from '../pagedesigner-mixin'

import YAML from 'yaml'

import { TileLayer } from 'leaflet'
import 'leaflet-providers'

import OhMapPage from '@/components/widgets/map/oh-map-page.vue'
import OhMapMarker from '@/components/widgets/map/oh-map-marker.vue'
import OhMapCircleMarker from '@/components/widgets/map/oh-map-circle-marker.vue'

const ConfigurableWidgets = {
  OhMapMarker,
  OhMapCircleMarker
}

import PageSettings from '@/components/pagedesigner/page-settings.vue'

import ConfigSheet from '@/components/config/config-sheet.vue'
import { useViewArea } from '@/composables/useViewArea.ts'

export default {
  mixins: [PageDesigner],
  components: {
    editor: defineAsyncComponent(() => import(/* webpackChunkName: "script-editor" */ '@/components/config/controls/script-editor.vue')),
    OhMapPage,
    PageSettings,
    ConfigSheet
  },
  props: {
    createMode: Boolean,
    uid: String,
    f7router: Object,
    f7route: Object
  },
  setup () {
    useViewArea()

    return { theme }
  },
  data () {
    // populate the list of tile providers with variants
    const isOverlay = function (providerName) {
      // https://github.com/leaflet-extras/leaflet-providers/blob/bc7482c62f1bbe3737682777716ec946e052deb6/preview/preview.js#L56
      let overlayPatterns = [
        '^(OpenWeatherMap|OpenSeaMap)',
        'OpenMapSurfer.(Hybrid|AdminBounds|ContourLines|Hillshade|ElementsAtRisk)',
        'Stamen.Toner(Hybrid|Lines|Labels)',
        'Hydda.RoadsAndLabels',
        '^JusticeMap',
        'OpenPtMap',
        'OpenRailwayMap',
        'OpenFireMap',
        'SafeCast',
        'WaymarkedTrails.(hiking|cycling|mtb|slopes|riding|skating)'
      ]

      return providerName.match('(' + overlayPatterns.join('|') + ')') !== null
    }
    const tileProviders = TileLayer.Provider.providers
    let pageWidgetDefinition = OhMapPage.widget()
    let tileLayerProviderOptions = []
    let overlayTileLayerProviderOptions = []
    for (const providerKey in tileProviders) {
      let option, options
      if (tileProviders[providerKey].variants) {
        for (const providerVariantKey in tileProviders[providerKey].variants) {
          option = providerKey + '.' + providerVariantKey
          options = isOverlay(option) ? overlayTileLayerProviderOptions : tileLayerProviderOptions
          options.push({ value: option, label: option })
        }
      } else {
        option = providerKey
        options = isOverlay(option) ? overlayTileLayerProviderOptions : tileLayerProviderOptions
        options.push({ value: option, label: option })
      }
    }
    const tileProviderParam = pageWidgetDefinition.props.parameters.find((p) => p.name === 'tileLayerProvider')
    tileProviderParam.limitToOptions = true
    tileProviderParam.options = tileLayerProviderOptions
    const overlayTileProviderParam = pageWidgetDefinition.props.parameters.find((p) => p.name === 'overlayTileLayerProvider')
    overlayTileProviderParam.limitToOptions = true
    overlayTileProviderParam.options = overlayTileLayerProviderOptions

    return {
      pageWidgetDefinition,
      forceEditMode: true,
      page: {
        uid: 'page_' + f7.utils.id(),
        component: 'oh-map-page',
        config: {},
        tags: [],
        slots: { default: [] }
      }
    }
  },
  methods: {
    markerDefaultIcon (marker) {
      const widgetDefinition = Object.values(ConfigurableWidgets).find((c) => c.widget && typeof c.widget === 'function' && c.widget().name === marker.component)
      if (widgetDefinition) {
        return widgetDefinition.widget().icon
      }
      return null
    },
    addWidget (component, widgetType, parentContext, slot) {
      if (!slot) slot = 'default'
      if (!component.slots) component.slots = {}
      if (!component.slots[slot]) component.slots[slot] = []
      if (widgetType) {
        component.slots[slot].push({
          component: widgetType,
          config: {
            label: 'New Marker'
          },
          slots: { default: [] }
        })
        this.forceUpdate()
      }
    },
    getWidgetDefinition (componentType) {
      const component = Object.values(ConfigurableWidgets).find((w) => w.widget && typeof w.widget === 'function' && w.widget().name === componentType)
      if (!component) return null
      return component.widget()
    },
    configureMarker (ev, marker, context) {
      let el = ev.target
      ev.cancelBubble = true
      while (!el.classList.contains('media-item')) {
        if (el && el.classList.contains('menu')) return
        el = el.parentElement
      }
      this.context.editmode.configureWidget(marker, context)
    },
    toYaml () {
      this.pageYaml = YAML.stringify({
        component: this.page.component,
        config: this.page.config,
        markers: this.page.slots.default
      })
    },
    fromYaml () {
      try {
        const updatedPage = YAML.parse(this.pageYaml)
        this.page.config = updatedPage.config
        this.page.slots.default = updatedPage.markers
        this.forceUpdate()
        return true
      } catch (e) {
        f7.dialog.alert(e).open()
        return false
      }
    }
  }
}
</script>
