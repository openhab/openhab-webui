<template>
  <l-map
    v-if="showMap"
    :zoom="zoom"
    :center="center"
    :options="mapOptions"
    @click="mapClicked"
    ref="map"
    class="oh-map-picker-lmap">
    <l-tile-layer
      :url="url"
      :attribution="attribution" />
    <l-marker v-if="marker" :lat-lng="marker" />
  </l-map>
</template>

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
  props: ['value'],
  components: {
    LMap,
    LTileLayer,
    LMarker
  },
  data () {
    return {
      showMap: false,
      zoom: 1,
      center: latLng(48, 6),
      // url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      url: `https://a.basemaps.cartocdn.com/${this.$f7.data.themeOptions.dark}_all/{z}/{x}/{y}.png`,
      attribution: '&copy; <a class="external" target="_blank" href="http://osm.org/copyright">OpenStreetMap</a>, &copy; <a class="external" target="_blank" href="https://carto.com/attribution/">CARTO</a>',
      marker: null,
      mapOptions: {
        zoomSnap: 0.5
      }
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.zoom = (this.value) ? 15 : 1
      this.marker = (this.value) ? latLng(this.value.split(',')) : null
      this.center = (this.value) ? latLng(this.value.split(',')) : latLng(48, 6)
      this.showMap = true
      if (!this.value) {
        this.$oh.api.get('/rest/services/org.openhab.i18n/config')
          .then((data) => {
            if (data.location) {
              this.center = latLng(data.location.split(','))
              this.zoom = 15
              this.showMap = false
              this.$nextTick(() => {
                this.showMap = true
              })
            }
          })
          .catch(() => {
            // silently ignore if the request is not permitted for the user
          })
      }
    })
  },
  methods: {
    mapClicked (evt) {
      this.marker = latLng(evt.latlng)
      this.$emit('input', this.marker)
    }
  }
}
</script>
