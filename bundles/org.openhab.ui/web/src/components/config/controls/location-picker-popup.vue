<template>
  <f7-popup ref="mapPicker"
            class="mappicker-popup"
            @popup:open="mapPickerOpen"
            @popup:closed="mapPickerClosed">
    <f7-page>
      <f7-navbar>
        <f7-nav-left>
          <f7-link icon-ios="f7:arrow_left"
                   icon-md="material:arrow_back"
                   icon-aurora="f7:arrow_left"
                   popup-close />
        </f7-nav-left>
        <f7-nav-title>{{ title }}</f7-nav-title>
        <f7-nav-right>
          <f7-link class="popup-close" @click="updateValue(currentPosition)">
            Done
          </f7-link>
        </f7-nav-right>
      </f7-navbar>

      <location-picker v-if="showMap" :value="currentPosition" @input="updatePosition" />
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
export default {
  props: ['value', 'title'],
  components: {
    'location-picker': () => import(/* webpackChunkName: "location-picker" */ './location-picker.vue')
  },
  data () {
    return {
      showMap: false,
      currentPosition: null
    }
  },
  watch: {
    value (val) {
      this.currentPosition = val
    }
  },
  methods: {
    updateValue () {
      if (this.currentPosition) {
        this.$f7.emit('locationUpdate', this.currentPosition)
      }
    },
    updatePosition (event) {
      if (event.lat && event.lng) {
        this.currentPosition = [event.lat, event.lng].join(',')
      }
    },
    mapPickerClosed () {
      this.showMap = false
      this.$f7.emit('locationPickerClosed')
    },
    mapPickerOpen () {
      this.currentPosition = this.value
      this.$nextTick(() => {
        this.showMap = true
      })
    }
  }
}
</script>
