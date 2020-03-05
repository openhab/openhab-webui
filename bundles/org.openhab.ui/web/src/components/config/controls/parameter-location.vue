<template>
  <ul>
      <f7-list-input
        :floating-label="$theme.md"
        :label="configDescription.label"
        :name="configDescription.name"
        :value="value"
        :required="configDescription.required" validate
        :clear-button="!configDescription.required"
        @input="updateValue"
        type="text">
        <div class="padding-left" slot="content-end">
          <f7-button slot="content-end" @click="openMapPicker"><f7-icon f7="placemark" /> Map</f7-button>
        </div>
      </f7-list-input>
      <f7-popup ref="mapPicker" class="mappicker-popup" close-on-escape :opened="mapPickerOpen" @popup:opened="mapPickerOpened" @popup:closed="mapPickerClosed">
        <f7-page>
          <f7-navbar>
            <f7-nav-left>
              <f7-link icon-ios="f7:arrow_left" icon-md="material:arrow_back" icon-aurora="f7:arrow_left" popup-close></f7-link>
            </f7-nav-left>
            <f7-nav-title>{{configDescription.label}}</f7-nav-title>
            <f7-nav-right>
              <f7-link @click="updateValue(marker)">Done</f7-link>
            </f7-nav-right>
          </f7-navbar>

          <l-map
            v-if="showMap"
            :zoom="zoom"
            :center="center"
            :options="mapOptions"
            @click="mapClicked"
            class="oh-map-page-lmap">
              <l-tile-layer
                :url="url"
                :attribution="attribution"
              />
              <l-marker :lat-lng="marker" />
          </l-map>

        </f7-page>

      </f7-popup>
  </ul>
</template>

<style lang="stylus">

</style>

<script>
import { latLng, Icon } from 'leaflet'
import { LMap, LTileLayer, LMarker } from 'vue2-leaflet'
import 'leaflet/dist/leaflet.css'

delete Icon.Default.prototype._getIconUrl
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
})

export default {
  props: ['configDescription', 'value'],
  components: {
    LMap,
    LTileLayer,
    LMarker
  },
  data () {
    return {
      mapPickerOpen: false,
      zoom: 13,
      center: latLng(52.5200066, 13.4049540),
      // url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      url: `https://a.basemaps.cartocdn.com/${this.$f7.data.themeOptions.dark}_all/{z}/{x}/{y}.png`,
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution/">CARTO</a>',
      marker: latLng(52.5200066, 13.4049540),
      showMap: false,
      mapOptions: {
        zoomSnap: 0.5
      }
    }
  },
  methods: {
    updateValue (event) {
      if (event.lat && event.lng) {
        this.$emit('input', [event.lat, event.lng].join(','))
      } else {
        this.$emit('input', event.target.value)
      }
      this.mapPickerOpen = false
    },
    mapPickerClosed () {
      this.showMap = false
      this.mapPickerOpen = false
    },
    mapPickerOpened () {
      this.$nextTick(() => { this.showMap = true })
    },
    mapClicked (evt) {
      this.marker = latLng(evt.latlng)
    },
    openMapPicker () {
      this.mapPickerOpen = true
    }
  }
}
</script>
