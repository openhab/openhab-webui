<template>
  <l-marker ref="marker"
            v-if="coords"
            :key="markerKey"
            :lat-lng="coords"
            @click="performAction">
    <l-tooltip v-if="config.label">
      {{ config.label }}
    </l-tooltip>
    <l-icon v-if="icon"
            :icon-size="[40,40]"
            :icon-url="icon" />
  </l-marker>
</template>

<script>
import { utils } from 'framework7'

import mixin from '../widget-mixin'
import { LMarker, LTooltip, LIcon } from '@vue-leaflet/vue-leaflet'
import { actionsMixin } from '../widget-actions'
import { OhMapMarkerDefinition } from '@/assets/definitions/widgets/map'

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
      markerKey: utils.id()
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
    },
    hasIcon () {
      return this.config.icon
    }
  },
  asyncComputed: {
    icon () {
      if (this.config.icon && this.config.icon.indexOf('oh:') === 0) {
        return this.$oh.media.getIcon(this.config.icon.substring(3)).then((icon) => {
          this.markerKey = utils.id()
          this.$emit('update')
          return icon
        })
      }
      return null
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
