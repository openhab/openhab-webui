<template>
  <div ref="page" :class="scopedCssUid">
    <l-map
      v-if="showMap"
      ref="map"
      :zoom="zoom"
      :min-zoom="minZoom"
      :crs="crs"
      :options="mapOptions"
      :zoom-animation="!config.noZoomAnimation"
      :marker-zoom-animation="!config.noMarkerZoomAnimation"
      :max-bounds="bounds"
      :key="mapKey"
      class="oh-plan-page-lmap"
      @ready="onMapReady"
      :class="{
        'with-tabbar': context.tab,
        'oh-plan-white-background': config.backgroundColor === 'white',
        'oh-plan-black-background': config.backgroundColor === 'black',
        'oh-plan-blackwhite-background': config.backgroundColor === 'blackwhite',
        'oh-plan-dark-mode-invert': config.darkModeInvert,
        'oh-plan-tooltip-black': config.tooltipColor === 'black',
        'oh-plan-tooltip-blackwhite': config.tooltipColor === 'blackwhite'
      }"
      @update:center="centerUpdate"
      @update:zoom="zoomUpdate">
      <l-image-overlay v-if="!config.embedSvg && backgroundImageUrl" :url="backgroundImageUrl" :bounds="bounds" />
      <l-feature-group v-if="context.component.slots" ref="featureGroup">
        <template v-for="(marker, idx) in defaultSlots" :key="idx">
          <component
            :is="markerComponent(marker)"
            v-if="isMarkerVisible(marker)"
            :context="childContext(marker)"
            @update="onMarkerUpdate" />
        </template>
      </l-feature-group>
      <l-control v-if="context.editmode?.isEditable" position="topright">
        <f7-menu class="padding">
          <f7-menu-item @click="context.editmode.addWidget(context.component, 'oh-plan-marker')" icon-f7="plus" text="Add Marker" />
          <f7-menu-item v-if="context.clipboardtype" @click="context.editmode.pasteWidget(context.component)" icon-f7="square_on_square" />
        </f7-menu>
      </l-control>
      <l-control v-if="context.editmode" position="bottomleft">
        <span>Zoom Level: {{ currentZoom.toFixed(2) }}</span>
      </l-control>
    </l-map>
  </div>
</template>

<style lang="stylus">
.oh-plan-page-lmap
  position absolute
  background-color var(--f7-page-bg-color)
  top calc(var(--f7-safe-area-top) + var(--f7-navbar-height))
  height calc(100% - var(--f7-safe-area-top) - var(--f7-navbar-height)) !important
  &.with-tabbar
    height calc(100% - var(--f7-safe-area-top) - var(--f7-navbar-height) - var(--f7-tabbar-labels-height)) !important
  &.oh-plan-white-background, &.oh-plan-blackwhite-background
    background-color white
  &.oh-plan-black-background
    background-color black
.dark
  .oh-plan-page-lmap
    &.oh-plan-blackwhite-background
      background-color black
    &.oh-plan-dark-mode-invert .leaflet-image-layer
      filter invert()

// Tooltip Color

dark-tooltip()
  .leaflet-tooltip
    background-color black
    color white
    border-color black
    box-shadow 0 1px 3px rgb(255 255 255 / 40%)
    &.leaflet-tooltip-top
      &::before
        border-top-color black
    &.leaflet-tooltip-bottom
      &::before
        border-bottom-color black
    &.leaflet-tooltip-left
      &::before
        border-left-color black
    &.leaflet-tooltip-right
      &::before
        border-right-color black

.oh-plan-tooltip-black
  dark-tooltip()

.dark
  .oh-plan-tooltip-blackwhite
    dark-tooltip()

// override leaflet style
.oh-plan-page-lmap .leaflet-div-icon
  background: unset
  border: unset

// Make tooltips non-interactive so touch events pass through to markers on mobile
.oh-plan-page-lmap .leaflet-tooltip
  pointer-events none

// Map drag/zoom works over the SVG; interactive [openhab] elements re-enable pointer events
// inline (see subscribeEmbeddedSvgListeners) so the interior of fill:none shapes stays clickable
.oh-plan-page-lmap .oh-plan-embedded-svg
  pointer-events none
  [openhab]
    cursor pointer
</style>

<script>
import { nextTick, computed } from 'vue'
import { f7 } from 'framework7-vue'

import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import { useWidgetAction } from '@/components/widgets/useWidgetAction.ts'
import { Icon, CRS, SVGOverlay } from 'leaflet'
import { LMap, LImageOverlay, LFeatureGroup, LControl } from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'

import embeddedSvgMixin from '@/components/widgets/svg/oh-embedded-svg-mixin'
import OhPlanMarker from './oh-plan-marker.vue'
import { OhPlanPageDefinition } from '@/assets/definitions/widgets/plan'

// Do NOT remove: required for Leaflet to render in prod build
delete Icon.Default.prototype._getIconUrl
Icon.Default.mergeOptions({
  iconRetinaUrl: import('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: import('leaflet/dist/images/marker-icon.png'),
  shadowUrl: import('leaflet/dist/images/marker-shadow.png')
})

export default {
  mixins: [embeddedSvgMixin],
  props: {
    context: Object
  },
  components: {
    LMap,
    LImageOverlay,
    LControl,
    LFeatureGroup
  },
  widget: OhPlanPageDefinition,
  setup(props) {
    const context = computed(() => props.context)
    const { config, scopedCssUid, childContext, defaultSlots, evaluateExpression } = useWidgetContext(context)
    // aliased so it doesn't clobber the performAction() method below, which the SVG mixin calls
    const { performAction: runWidgetAction } = useWidgetAction(context, config, evaluateExpression)
    return { config, scopedCssUid, childContext, defaultSlots, runWidgetAction }
  },
  data() {
    return {
      currentZoom: 13,
      currentCenter: null,
      minZoom: -2,
      zoom: -0.5,
      crs: CRS.Simple,
      showMap: false,
      mapKey: f7.utils.id(),
      embeddedSvgElement: null,
      embeddedSvgOverlay: null,
      embeddedSvgToken: 0
    }
  },
  computed: {
    bounds() {
      const lat = this.config.imageHeight || 1000
      const lng = this.config.imageWidth || 1000
      return [
        [0, 0],
        [lat, lng]
      ]
    },
    mapOptions() {
      return Object.assign(
        {
          zoomSnap: 0.1,
          tap: false
        },
        this.config.noZoomOrDrag
          ? {
              dragging: false,
              touchZoom: false,
              doubleClickZoom: false,
              scrollWheelZoom: false,
              zoomControl: false
            }
          : {}
      )
    }
  },
  asyncComputed: {
    backgroundImageUrl() {
      return this.$oh.media.getImage(this.config.imageUrl)
    }
  },
  watch: {
    'config.noZoomOrDrag': function (val) {
      this.refreshMap()
    },
    'config.embedSvg': function () {
      this.refreshMap()
    },
    backgroundImageUrl(val) {
      this.showMap = true
      this.refreshMap()
    }
  },
  beforeUnmount() {
    this.removePlanSvg()
  },
  methods: {
    markerComponent(marker) {
      return OhPlanMarker
    },
    isMarkerVisible(marker) {
      if (this.context.editmode) return true
      const zoomVisibilityMin = parseFloat(marker.config.zoomVisibilityMin)
      const zoomVisibilityMax = parseFloat(marker.config.zoomVisibilityMax)
      const isVisibleMin = isNaN(zoomVisibilityMin) || zoomVisibilityMin < this.currentZoom
      const isVisibleMax = isNaN(zoomVisibilityMax) || zoomVisibilityMax > this.currentZoom
      return isVisibleMin && isVisibleMax
    },
    zoomUpdate(zoom) {
      this.currentZoom = zoom
    },
    centerUpdate(center) {
      this.currentCenter = center
    },
    onMarkerUpdate() {},
    onMapReady() {
      this.fitMapBounds()
      if (this.config.embedSvg && this.config.imageUrl) {
        this.embedPlanSvg()
      }
    },
    fitMapBounds() {
      if (this.$refs.map) {
        this.$refs.map.leafletObject?.fitBounds(this.bounds)
      }
    },
    refreshMap() {
      this.removePlanSvg()
      this.mapKey = f7.utils.id()
      nextTick(() => {
        this.fitMapBounds()
      })
    },
    // Mixin overrides: the SVG lives in the Leaflet overlay rather than a canvas container,
    // and the plan page is the top-level widget so it runs SVG actions itself instead of emitting them.
    embeddedSvgRoot() {
      return this.embeddedSvgElement
    },
    performAction(evt, prefix, config, context) {
      this.runWidgetAction(evt, prefix || '', context, config)
    },
    embedPlanSvg() {
      this.removePlanSvg()
      const map = this.$refs.map?.leafletObject
      if (!map) return
      // invalidation token: an unmount or re-embed bumps it so a stale in-flight fetch is discarded
      const token = ++this.embeddedSvgToken
      this.fetchEmbeddedSvgText()
        .then((svgCode) => {
          // bail if this embed was superseded or the map was torn down while the SVG was loading
          if (token !== this.embeddedSvgToken || !this.$refs.map?.leafletObject) return
          const svgEl = new DOMParser().parseFromString(svgCode, 'image/svg+xml').documentElement
          if (!svgEl || svgEl.tagName.toLowerCase() !== 'svg') {
            return Promise.reject(new Error(`${this.config.imageUrl} did not parse to a valid SVG element`))
          }
          svgEl.classList.add('oh-plan-embedded-svg', 'disable-user-drag')
          this.embeddedSvgElement = svgEl
          // interactive:false stops Leaflet capturing pointer events for the whole SVG; CSS re-enables them per [openhab] element
          this.embeddedSvgOverlay = new SVGOverlay(svgEl, this.bounds, { interactive: false })
          this.embeddedSvgOverlay.addTo(map)
          this.subscribeEmbeddedSvgListeners()
          this.setupEmbeddedSvgStateTracking()
          this.embeddedSvgReady = true
        })
        .catch((err) => {
          nextTick(() => {
            f7.toast.create({ text: 'Failed to embed SVG: ' + err, closeTimeout: 3000 }).open()
          })
        })
    },
    removePlanSvg() {
      // invalidate any in-flight embed even when nothing is mounted yet
      this.embeddedSvgToken++
      if (!this.embeddedSvgReady && !this.embeddedSvgOverlay) return
      this.unsubscribeEmbeddedSvgListeners()
      this.unsubscribeEmbeddedSvgStateTracking()
      if (this.embeddedSvgOverlay) {
        this.embeddedSvgOverlay.remove()
        this.embeddedSvgOverlay = null
      }
      this.embeddedSvgElement = null
      this.embeddedSvgReady = false
    }
  }
}
</script>
