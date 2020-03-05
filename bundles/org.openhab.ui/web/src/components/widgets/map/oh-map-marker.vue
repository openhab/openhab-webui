<template>
  <l-marker ref="marker" v-if="coords" :key="markerKey" :lat-lng="coords" @update:latLng="$emit('update', $event)" @click="performAction">
    <l-tooltip v-if="config.label">
      {{config.label}}
    </l-tooltip>
    <l-icon v-if="icon"
      :icon-size="[40,40]"
      :icon-url="icon"
    />
  </l-marker>
</template>

<script>
import mixin from '../widget-mixin'
import { LMarker, LTooltip, LIcon } from 'vue2-leaflet'
import { actionGroup, actionProps, actionsMixin } from '../widget-actions'

export default {
  mixins: [mixin, actionsMixin],
  components: {
    LMarker,
    LTooltip,
    LIcon
  },
  widget: {
    name: 'oh-map-marker',
    label: 'Map Marker',
    icon: 'map_pin',
    description: 'A marker on a map',
    props: {
      parameterGroups: [
        actionGroup(null, 'Action to perform when the marker is clicked')
      ],
      parameters: [
        ...actionProps(),
        {
          name: 'label',
          label: 'Label',
          type: 'TEXT',
          description: 'The label on the marker'
        },
        {
          name: 'item',
          label: 'Item',
          type: 'TEXT',
          context: 'item',
          description: 'The Location item this marker will show'
        },
        {
          name: 'location',
          label: 'Fixed location',
          type: 'TEXT',
          context: 'location',
          description: 'The fixed location to show if no item is configured or its coordinates are invalid'
        },
        {
          name: 'icon',
          label: 'Icon',
          type: 'TEXT',
          description: 'Use <code>oh:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://www.openhab.org/docs/configuration/iconsets/classic/">openHAB icon</a>)'
        }
      ]
    }
  },
  data () {
    return {
      markerKey: this.$f7.utils.id()
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
          // debugger
          this.markerKey = this.$f7.utils.id()
          this.$emit('update')
          return icon
        })
      }
      return null
    }
  },
  mounted () {
    this.$emit('update', this.coords)
  }
}
</script>
