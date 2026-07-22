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
      <l-feature-group v-if="'slots' in context.component" ref="featureGroup">
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

<script setup lang="ts">
import { nextTick, computed, ref, watch, onBeforeUnmount, useTemplateRef, type Ref } from 'vue'
import { type Router } from 'framework7'
import { f7 } from 'framework7-vue'
import { computedAsync } from '@vueuse/core'

import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import { useWidgetAction, type WidgetActionConfig } from '@/components/widgets/useWidgetAction.ts'
import { useSvgEmbedded } from '@/components/widgets/svg/useSvgEmbedded'
import media from '@/js/openhab/media'
import * as api from '@/api'

import { Icon, CRS, SVGOverlay, type BoundsLiteral } from 'leaflet'
import { LMap, LImageOverlay, LFeatureGroup, LControl } from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'

import OhPlanMarker from './oh-plan-marker.vue'
import { OhPlanMarker as OhPlanMarkerType, OhPlanPage as OhPlanPageType } from '@/types/components/widgets'
import { OhPlanPageDefinition } from '@/assets/definitions/widgets/plan'
import type { WidgetContext } from '../types'

import { showToast } from '@/js/dialog-promises'
import type { Framework7Events } from '@/types/framework7-extensions'

// Do NOT remove: required for Leaflet to render in prod build
// @ts-expect-error-next-line
delete Icon.Default.prototype._getIconUrl
Icon.Default.mergeOptions({
  iconRetinaUrl: import('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: import('leaflet/dist/images/marker-icon.png'),
  shadowUrl: import('leaflet/dist/images/marker-shadow.png')
})

// Defines
const props = defineProps<{
  context: WidgetContext
  f7router: Router.Router
}>()

defineOptions({
  widget: OhPlanPageDefinition
})

// Composables
const context = computed(() => props.context)
const { config, scopedCssUid, childContext, defaultSlots, evaluateExpression } = useWidgetContext(context, OhPlanPageType.isConfig)
const { performAction } = useWidgetAction(context, config as Ref<WidgetActionConfig>, evaluateExpression)

const { embeddedSvgReady, loadAndEmbedSvg, removeEmbeddedSvg } = useSvgEmbedded({
  editmode: computed(() => Boolean(context.value.editmode)),
  embeddedSvgActions: computed(() => config.value.embeddedSvgActions || {}),
  embedSvgFlashing: computed(() => config.value.embedSvgFlashing || false),
  performAction: (evt, prefix, config) => {
    performAction(evt ?? undefined, prefix || '', context.value, config)
  },
  f7router: props.f7router,
  updateSvgElementConfig: (id, config) => {
    f7.emit('svgOnclickConfigUpdate' as Framework7Events, { id, config })
  }
})

// States & Data
const mapRef = useTemplateRef<typeof LMap>('map')
const currentZoom = ref(13)
const currentCenter = ref<[number, number] | null>(null)
const zoom = ref(-0.5)
const showMap = ref(false)
const mapKey = ref(f7.utils.id())

const minZoom = -2
const crs = CRS.Simple

let embeddedSvgOverlay: SVGOverlay | null = null
let embeddedSvgToken = 0

// Computed
const bounds = computed<BoundsLiteral>(() => {
  const lat = config.value.imageHeight || 1000
  const lng = config.value.imageWidth || 1000
  return [
    [0, 0],
    [lat, lng]
  ]
})

const mapOptions = computed(() => {
  return Object.assign(
    {
      zoomSnap: 0.1,
      tap: false
    },
    config.value.noZoomOrDrag
      ? {
          dragging: false,
          touchZoom: false,
          doubleClickZoom: false,
          scrollWheelZoom: false,
          zoomControl: false
        }
      : {}
  )
})

const backgroundImageUrl = computedAsync(async () => {
  if (!config.value.imageUrl) return null
  return media.getImage(config.value.imageUrl)
})

// Watchers
watch(
  () => config.value.noZoomOrDrag,
  () => {
    refreshMap()
  }
)

watch(
  () => config.value.embedSvg,
  () => {
    refreshMap()
  }
)

watch(backgroundImageUrl, () => {
  showMap.value = true
  refreshMap()
})

// Lifecycle
onBeforeUnmount(() => {
  removeEmbeddedSvg(removePlanSvg)
})

// Methods
function markerComponent(marker: api.UiComponent) {
  return OhPlanMarker
}

function isMarkerVisible(marker: api.UiComponent) {
  if (context.value.editmode) return true

  const markerConfig = marker.config as OhPlanMarkerType.Config

  const zoomVisibilityMin =
    typeof markerConfig.zoomVisibilityMin === 'number' ? markerConfig.zoomVisibilityMin : parseFloat(String(markerConfig.zoomVisibilityMin))
  const zoomVisibilityMax =
    typeof markerConfig.zoomVisibilityMax === 'number' ? markerConfig.zoomVisibilityMax : parseFloat(String(markerConfig.zoomVisibilityMax))
  const isVisibleMin = isNaN(zoomVisibilityMin) || zoomVisibilityMin < currentZoom.value
  const isVisibleMax = isNaN(zoomVisibilityMax) || zoomVisibilityMax > currentZoom.value
  return isVisibleMin && isVisibleMax
}

function zoomUpdate(zoom: number) {
  currentZoom.value = zoom
}

function centerUpdate(center: [number, number]) {
  currentCenter.value = center
}

function onMarkerUpdate() {}

async function onMapReady() {
  fitMapBounds()
  if (config.value.embedSvg && config.value.imageUrl) {
    try {
      await loadAndEmbedSvg(config.value.imageUrl, undefined, embedPlanSvg)
    } catch (err) {
      console.error('Failed to embed SVG:', err)
      showToast('Failed to embed SVG: ' + err)
    }
  }
}

function fitMapBounds() {
  if (mapRef.value) {
    mapRef.value.leafletObject?.fitBounds(bounds.value)
  }
}

function refreshMap() {
  removeEmbeddedSvg(removePlanSvg)
  mapKey.value = f7.utils.id()
  nextTick(() => {
    fitMapBounds()
  })
}

/**
 * Callback function to embed the SVG into the Leaflet map; called by useSvgEmbedded after the SVG file is loaded.
 * @param svgCode The SVG markup text to embed.
 * @returns The embedded SVG element, or null if embedding failed or was canceled.
 */
function embedPlanSvg(svgCode: string): SVGSVGElement | null {
  removeEmbeddedSvg(removePlanSvg)
  const map = mapRef.value?.leafletObject
  if (!map) return null
  // invalidation token: an unmount or re-embed bumps it so a stale in-flight fetch is discarded
  const token = ++embeddedSvgToken
  try {
    // bail if this embed was superseded or the map was torn down while the SVG was loading
    if (token !== embeddedSvgToken || !mapRef.value?.leafletObject) return null
    const parsedRoot = new DOMParser().parseFromString(svgCode, 'image/svg+xml').documentElement
    if (!(parsedRoot instanceof SVGSVGElement) || parsedRoot.tagName.toLowerCase() !== 'svg') {
      throw new Error(`${config.value.imageUrl} did not parse to a valid SVG element`)
    }
    const svgEl = parsedRoot
    svgEl.classList.add('oh-plan-embedded-svg', 'disable-user-drag')
    // interactive:false stops Leaflet capturing pointer events for the whole SVG; CSS re-enables them per [openhab] element
    embeddedSvgOverlay = new SVGOverlay(svgEl, bounds.value, { interactive: false })
    embeddedSvgOverlay.addTo(map)
    return svgEl
  } catch (err) {
    nextTick(() => {
      showToast('Failed to embed SVG: ' + err)
    })
    return null
  }
}

/**
 * Callback function to remove the embedded SVG from the Leaflet map; called by useSvgEmbedded when the SVG is unloaded or the component is unmounted.
 *
 * @param svgRoot The root SVG element to remove.
 */
function removePlanSvg(svgRoot: Ref<SVGSVGElement | null>) {
  // invalidate any in-flight embed even when nothing is mounted yet
  embeddedSvgToken++
  if (!embeddedSvgReady.value && !embeddedSvgOverlay) return
  if (embeddedSvgOverlay) {
    embeddedSvgOverlay.remove()
    embeddedSvgOverlay = null
  }
}
</script>
