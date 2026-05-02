<template>
  <l-marker v-if="coords" ref="marker" :key="markerKey" :lat-lng="coords" @click="performAction">
    <l-tooltip v-if="config.label">
      {{ config.label }}
    </l-tooltip>
    <l-icon v-if="icon" :icon-size="icon.iconSize" :icon-url="icon.iconUrl" />
  </l-marker>
</template>

<script>
import { f7 } from 'framework7-vue'
import { computed } from 'vue'

import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import { LMarker, LTooltip, LIcon } from '@vue-leaflet/vue-leaflet'
import { OhMapMarkerDefinition } from '@/assets/definitions/widgets/map'

import markerIcon from 'leaflet/dist/images/marker-icon.png'
import { useWidgetAction } from '@/components/widgets/useWidgetAction.ts'

export default {
  props: {
    context: Object
  },
  components: {
    LMarker,
    LTooltip,
    LIcon
  },
  widget: OhMapMarkerDefinition,
  emits: ['update'],
  setup(props) {
    const context = computed(() => props.context)
    const { config, evaluateExpression } = useWidgetContext(context)
    const { performAction } = useWidgetAction(context, config, evaluateExpression)
    return { config, performAction }
  },
  data() {
    return {
      markerKey: f7.utils.id()
    }
  },
  computed: {
    coords() {
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
    async icon() {
      if (!this.config.icon?.startsWith('oh:')) {
        this.markerKey = f7.utils.id()
        return {
          iconUrl: markerIcon,
          iconSize: [25, 41]
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
    coords(val) {
      if (val) {
        this.$emit('update', val)
      }
    }
  }
}
</script>
