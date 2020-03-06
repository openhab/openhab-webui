<template>
  <l-map
    ref="map"
    v-if="showMap"
    :zoom="zoom"
    :center="center"
    :options="mapOptions"
    class="oh-map-page-lmap"
    :class="{ 'with-tabbar': context.tab }"
    @update:center="centerUpdate"
    @update:zoom="zoomUpdate">
      <l-tile-layer
        :url="url"
        :attribution="attribution"
      />
      <l-feature-group ref="featureGroup" v-if="context.component.slots">
        <component v-for="(marker, idx) in context.component.slots.default" :key="idx"
          :is="markerComponent(marker)" :context="childContext(marker)" @update="onMarkerUpdate" />
      </l-feature-group>
  </l-map>
</template>

<style lang="stylus">
.oh-map-page-lmap
  position absolute
  background-color var(--f7-page-bg-color)
  top calc(var(--f7-navbar-height))
  height calc(100% - var(--f7-navbar-height)) !important
  &.with-tabbar
    height calc(100% - var(--f7-navbar-height) - var(--f7-tabbar-labels-height)) !important
</style>

<script>
import mixin from '../widget-mixin'
import { latLng, Icon } from 'leaflet'
import { LMap, LTileLayer, LFeatureGroup } from 'vue2-leaflet'
import 'leaflet/dist/leaflet.css'

import OhMapMarker from './oh-map-marker.vue'
import OhMapCircleMarker from './oh-map-circle-marker.vue'

delete Icon.Default.prototype._getIconUrl
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
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
  data () {
    return {
      zoom: 13,
      currentZoom: 13,
      currentCenter: null,
      center: latLng(52.5200066, 13.4049540),
      // url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      url: `https://a.basemaps.cartocdn.com/${this.$f7.data.themeOptions.dark}_all/{z}/{x}/{y}.png`,
      attribution: '&copy; <a class="external" target="_blank" href="http://osm.org/copyright">OpenStreetMap</a>, &copy; <a class="external" target="_blank" href="https://carto.com/attribution/">CARTO</a>',
      showMap: true,
      mapOptions: {
        zoomSnap: 0.5
      }
    }
  },
  methods: {
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
      this.$refs.map.mapObject.fitBounds(this.$refs.featureGroup.mapObject.getBounds().pad(0.5))
      this.$refs.map.mapObject.invalidateSize()
    }
  }
}
</script>
