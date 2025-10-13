<template>
  <l-map
    ref="map"
    :zoom="zoom"
    :center="center"
    :options="mapOptions"
    :zoom-animation="!config.noZoomAnimation"
    :marker-zoom-animation="!config.noMarkerZoomAnimation"
    class="oh-map-page-lmap"
    :class="{ 'with-tabbar': context.tab }"
    @update:center="centerUpdate"
    @update:zoom="zoomUpdate">
    <l-feature-group ref="featureGroup" v-if="context.component.slots">
      <component
        v-for="(marker, idx) in context.component.slots.default"
        :key="idx"
        :is="markerComponent(marker)"
        :context="childContext(marker)"
        @update="onMarkerUpdate" />
    </l-feature-group>
  </l-map>
</template>

<style lang="stylus">
.oh-map-page-lmap
  position absolute
  background-color var(--f7-page-bg-color)
  top calc(var(--f7-safe-area-top) + var(--f7-navbar-height))
  height calc(100% - var(--f7-safe-area-top) - var(--f7-navbar-height)) !important
  &.with-tabbar
    height calc(100% - var(--f7-safe-area-top) - var(--f7-navbar-height) - var(--f7-tabbar-labels-height)) !important

// override leaflet style
.leaflet-div-icon
  background: unset
  border: unset
</style>

<script>
import { nextTick } from 'vue'
import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'

import mixin from '../widget-mixin'
import { tileLayer, latLng, Icon } from 'leaflet'
import { LMap, LTileLayer, LFeatureGroup } from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'

import { OhMapPageDefinition } from '@/assets/definitions/widgets/map'

import OhMapMarker from './oh-map-marker.vue'
import OhMapCircleMarker from './oh-map-circle-marker.vue'

import 'leaflet-providers'

delete Icon.Default.prototype._getIconUrl
Icon.Default.mergeOptions({
  iconRetinaUrl: import('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: import('leaflet/dist/images/marker-icon.png'),
  shadowUrl: import('leaflet/dist/images/marker-shadow.png')
})

export default {
  mixins: [mixin],
  components: {
    LMap,
    LTileLayer,
    LFeatureGroup,
    OhMapMarker,
    OhMapCircleMarker
  },
  widget: OhMapPageDefinition,
  data () {
    return {
      zoom: this.context.component.config.initialZoom || 4,
      currentZoom: 13,
      currentCenter: null,
      center: (this.context.component.config.initialCenter) ? latLng(this.context.component.config.initialCenter.split(',')) : latLng(48, 6),
      // url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      url: `https://a.basemaps.cartocdn.com/${useUIOptionsStore().getDarkMode()}_all/{z}/{x}/{y}.png`,
      attribution: '&copy; <a class="external" target="_blank" href="http://osm.org/copyright">OpenStreetMap</a>, &copy; <a class="external" target="_blank" href="https://carto.com/attribution/">CARTO</a>'
    }
  },
  mounted () {
    // vue-leaflet docs say the leafletObject should be ready on the next tick after mounting,
    // but it isn't, so we have to wait for the map to be ready before we can initialise
    const check = () => {
      if (this.$refs.map?.ready) {
        console.debug('Map is now ready, initializing ...')
        this.initialize()
      } else {
        setTimeout(check, 10)
      }
    }
    nextTick(() => {
      check()
    })
  },
  methods: {
    initialize () {
      this.setBackgroundLayer()
      this.onMarkerUpdate()
    },
    setBackgroundLayer () {
      const defaultProvider = (useUIOptionsStore().getDarkMode() === 'dark') ? 'CartoDB.DarkMatter' : 'CartoDB.Positron'
      const provider = this.config.tileLayerProvider || defaultProvider
      let layer, overlayLayer
      try {
        layer = tileLayer.provider(provider, this.config.tileLayerProviderOptions)
      } catch {
        layer = tileLayer.provider(defaultProvider)
      }
      layer.addTo(this.$refs.map.leafletObject)

      if (this.config.overlayTileLayerProvider) {
        try {
          overlayLayer = tileLayer.provider(this.config.overlayTileLayerProvider, this.config.overlayTileLayerProviderOptions)
        } catch {}
        // Workaround for OpenWeatherMap - the old URLs need the "_new" suffix
        // See: https://openweathermap.org/api/weathermaps
        if (overlayLayer._url.indexOf('openweather') > 0) {
          overlayLayer._url = overlayLayer._url.replace('{variant}', '{variant}_new')
        }
        overlayLayer.addTo(this.$refs.map.leafletObject)
      }
      this.$refs.map.leafletObject.invalidateSize()
    },
    zoomUpdate (zoom) {
      this.currentZoom = zoom
    },
    centerUpdate (center) {
      this.currentCenter = center
    },
    markerComponent (marker) {
      switch (marker.component) {
        case 'oh-map-marker':
          return OhMapMarker
        case 'oh-map-circle-marker':
          return OhMapCircleMarker
        default:
          return null
      }
    },
    onMarkerUpdate () {
      nextTick(() => {
        const bounds = this.$refs.featureGroup.leafletObject.getBounds()
        if (bounds.isValid()) {
          this.$refs.map.leafletObject.fitBounds(bounds.pad(0.5))
          this.$refs.map.leafletObject.invalidateSize()
        }
      })
    }
  }
}
</script>
