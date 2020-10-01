<template>
  <f7-popup ref="mapPicker" class="mappicker-popup" @popup:opened="mapPickerOpened" @popup:closed="mapPickerClosed">
    <f7-page>
      <f7-navbar>
        <f7-nav-left>
          <f7-link icon-ios="f7:arrow_left" icon-md="material:arrow_back" icon-aurora="f7:arrow_left" popup-close></f7-link>
        </f7-nav-left>
        <f7-nav-title>{{title}}</f7-nav-title>
        <f7-nav-right>
          <f7-link class="popup-close" @click="updateValue(marker)">Done</f7-link>
        </f7-nav-right>
      </f7-navbar>

      <l-map
        v-if="showMap"
        :zoom="zoom"
        :center="center"
        :options="mapOptions"
        @click="mapClicked"
        class="oh-map-picker-lmap">
          <l-tile-layer
            :url="url"
            :attribution="attribution"
          />
          <l-marker v-if="marker" :lat-lng="marker" />
      </l-map>
    </f7-page>
  </f7-popup>
</template>

<style lang="stylus">
.mappicker-popup .oh-map-picker-lmap
  background-color var(--f7-page-bg-color)
  &.leaflet-grab
    cursor crosshair
.leaflet-dragging .oh-map-picker-lmap.leaflet-grab
  cursor grabbing !important
</style>

<script>
import { latLng, Icon } from 'leaflet'
import { LMap, LTileLayer, LMarker } from 'vue2-leaflet'
import 'leaflet/dist/leaflet.css'

delete Icon.Default.prototype._getIconUrl
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

export default {
  props: ['value', 'title'],
  components: {
    LMap,
    LTileLayer,
    LMarker
  },
  data () {
    return {
      zoom: 4,
      center: latLng(48, 6),
      // url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      url: `https://a.basemaps.cartocdn.com/${this.$f7.data.themeOptions.dark}_all/{z}/{x}/{y}.png`,
      attribution: '&copy; <a class="external" target="_blank" href="http://osm.org/copyright">OpenStreetMap</a>, &copy; <a class="external" target="_blank" href="https://carto.com/attribution/">CARTO</a>',
      marker: null,
      showMap: false,
      mapOptions: {
        zoomSnap: 0.5
      }
    }
  },
  methods: {
    updateValue (marker) {
      if (marker.lat && marker.lng) {
        this.$f7.emit('locationUpdate', marker)
      }
    },
    mapPickerClosed () {
      this.showMap = false
      this.$f7.emit('locationPickerClosed')
    },
    mapClicked (evt) {
      this.marker = latLng(evt.latlng)
    },
    mapPickerOpened () {
      this.$nextTick(() => {
        this.zoom = (this.value) ? 13 : 4
        this.marker = (this.value) ? latLng(this.value.split(',')) : null
        this.center = (this.value) ? latLng(this.value.split(',')) : latLng(48, 6)
        this.showMap = true
      })
    }
  }
}
</script>
