<template>
  <l-map
    v-if="showMap"
    :zoom="zoom"
    :center="center"
    :options="mapOptions"
    @click="mapClicked"
    ref="map"
    class="oh-map-picker-lmap"
    :class="{ invert: uiOptionsStore.darkMode === 'dark' }">
    <l-tile-layer :url="url" :attribution="attribution" />
    <l-marker v-if="marker" :lat-lng="marker" />
  </l-map>
</template>

<style lang="stylus">
.oh-map-picker-lmap.invert
  .leaflet-tile-pane
    filter invert(1) hue-rotate(180deg) brightness(120%) contrast(80%)
</style>

<script>
import { nextTick } from 'vue'

import { latLng, Icon } from 'leaflet'
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'

import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'
import { mapStores } from 'pinia'

import * as api from '@/api'

// Do NOT remove: required for Leaflet to render in prod build
delete Icon.Default.prototype._getIconUrl
Icon.Default.mergeOptions({
  iconRetinaUrl: import('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: import('leaflet/dist/images/marker-icon.png'),
  shadowUrl: import('leaflet/dist/images/marker-shadow.png')
})

export default {
  props: {
    value: String
  },
  emits: ['input'],
  components: {
    LMap,
    LTileLayer,
    LMarker
  },
  data() {
    return {
      showMap: false,
      zoom: 1,
      center: latLng(48, 6),
      // url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      url: `https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png`,
      attribution:
        '&copy; <a class="external" target="_blank" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a class="external" target="_blank" href="https://carto.com/attributions">CARTO</a>',
      marker: null,
      mapOptions: {
        zoomSnap: 0.5
      }
    }
  },
  computed: {
    ...mapStores(useUIOptionsStore)
  },
  mounted() {
    nextTick(() => {
      this.zoom = this.value ? 15 : 1
      this.marker = this.value ? latLng(this.value.split(',')) : null
      this.center = this.value ? latLng(this.value.split(',')) : latLng(48, 6)
      this.showMap = true
      if (!this.value) {
        api
          .getServiceConfig({ serviceId: 'org.openhab.i18n' })
          .then((data) => {
            if (data.location) {
              this.center = latLng(data.location.split(','))
              this.zoom = 15
              this.showMap = false
              nextTick(() => {
                this.showMap = true
              })
            }
          })
          .catch((err) => {
            // silently ignore if the request is not permitted for the user
            if (!(err.response?.statusText === 'Forbidden' || err.response?.status === 403)) {
              return Promise.reject(err)
            }
          })
      }
    })
  },
  watch: {
    'uiOptionsStore.darkMode': function () {
      this.showMap = false
      nextTick(() => {
        this.showMap = true
      })
    }
  },
  methods: {
    mapClicked(evt) {
      this.marker = latLng(evt.latlng)
      this.marker.lat = Number.parseFloat(this.marker.lat).toFixed(6)
      this.marker.lng = Number.parseFloat(this.marker.lng).toFixed(6)
      this.$emit('input', this.marker)
    }
  }
}
</script>
