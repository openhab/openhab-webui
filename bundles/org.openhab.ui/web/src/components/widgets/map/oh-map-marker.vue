<template>
  <l-marker ref="marker"
            v-if="coords"
            :key="markerKey"
            :lat-lng="coords"
            @click="performAction">
    <l-tooltip v-if="config.label">
      {{ config.label }}
    </l-tooltip>
    <l-icon v-if="icon" :icon-size="icon.iconSize" :icon-url="icon.iconUrl" />
  </l-marker>
</template>

<script>
import { f7 } from 'framework7-vue'

import mixin from '../widget-mixin'
import { LMarker, LTooltip, LIcon } from '@vue-leaflet/vue-leaflet'
import { actionsMixin } from '../widget-actions'
import { OhMapMarkerDefinition } from '@/assets/definitions/widgets/map'

import markerIcon from 'leaflet/dist/images/marker-icon.png'

export default {
  mixins: [mixin, actionsMixin],
  components: {
    LMarker,
    LTooltip,
    LIcon
  },
  widget: OhMapMarkerDefinition,
  emits: ['update'],
  data () {
    return {
      markerKey: f7.utils.id()
    }
  },
  computed: {
    coords () {
      if (this.config.item) {
        const itemState = this.context.store[this.config.item]
        if (itemState && itemState.state.indexOf(',') > 0) {
          return itemState.state.split(',')
        }
      }
      if (this.config.location) {
        return this.config.location.split(',')
      }
      return null
    }
  },
  asyncComputed: {
    async icon () {
      if (!this.config.icon?.startsWith('oh:')) {
        this.markerKey = f7.utils.id()
        return {
          iconUrl: markerIcon,
          iconSize: [25,41],
        }
      }

      const iconData = await this.$oh.media.getIcon(this.config.icon.substring(3))
      this.markerKey = f7.utils.id()
      this.$emit('update')
      return {
        iconUrl: iconData,
        iconSize: [40, 40]
      }
    }
  },
  watch: {
    coords (val) {
      if (val) {
        this.$emit('update', val)
      }
    }
  }
}
</script>
