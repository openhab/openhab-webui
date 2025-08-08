<template>
  <l-map
    ref="map"
    v-if="showMap"
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
      <component v-for="(marker, idx) in context.component.slots.default"
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
</style>

<script>
import mixin from '../widget-mixin'
import { tileLayer, latLng, Icon } from 'leaflet'
import { LMap, LTileLayer, LFeatureGroup } from 'vue2-leaflet'
import 'leaflet/dist/leaflet.css'

import { OhMapPageDefinition } from '@/assets/definitions/widgets/map'

import OhMapMarker from './oh-map-marker.vue'
import OhMapCircleMarker from './oh-map-circle-marker.vue'

import 'leaflet-providers'

delete Icon.Default.prototype._getIconUrl
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
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
      url: `https://a.basemaps.cartocdn.com/${this.$f7.data.themeOptions.dark}_all/{z}/{x}/{y}.png`,
      attribution: '&copy; <a class="external" target="_blank" href="http://osm.org/copyright">OpenStreetMap</a>, &copy; <a class="external" target="_blank" href="https://carto.com/attribution/">CARTO</a>',
      showMap: true
    }
  },
  mounted () {
    this.setBackgroundLayer()
    this.onMarkerUpdate()
  },
  computed: {
    mapOptions () {
      return Object.assign({
        zoomSnap: 0.1
      }, this.config.noZoomOrDrag ? {
        dragging: false,
        touchZoom: false,
        doubleClickZoom: false,
        scrollWheelZoom: false,
        zoomControl: false
      } : {})
    }
  },
  methods: {
    setBackgroundLayer () {
      const defaultProvider = (this.$f7.data.themeOptions.dark === 'dark') ? 'CartoDB.DarkMatter' : 'CartoDB.Positron'
      const provider = this.config.tileLayerProvider || defaultProvider
      let layer, overlayLayer
      try {
        layer = tileLayer.provider(provider, this.config.tileLayerProviderOptions)
      } catch {
        layer = tileLayer.provider(defaultProvider)
      }
      layer.addTo(this.$refs.map.mapObject)

      if (this.config.overlayTileLayerProvider) {
        try {
          overlayLayer = tileLayer.provider(this.config.overlayTileLayerProvider, this.config.overlayTileLayerProviderOptions)
        } catch {}
        // Workaround for OpenWeatherMap - the old URLs need the "_new" suffix
        // See: https://openweathermap.org/api/weathermaps
        if (overlayLayer._url.indexOf('openweather') > 0) {
          overlayLayer._url = overlayLayer._url.replace('{variant}', '{variant}_new')
        }
        overlayLayer.addTo(this.$refs.map.mapObject)
      }
      this.$refs.map.mapObject.invalidateSize()
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
      this.$nextTick(() => {
        const bounds = this.$refs.featureGroup.mapObject.getBounds()
        if (bounds.isValid()) {
          this.$refs.map.mapObject.fitBounds(bounds.pad(0.5))
          this.$refs.map.mapObject.invalidateSize()
        }
      })
    }
  }
}
</script>
