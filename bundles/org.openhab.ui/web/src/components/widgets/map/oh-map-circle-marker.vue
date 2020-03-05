<template>
  <l-circle ref="marker" v-if="center && radius" :key="markerKey" :lat-lng="center" :radius="radius" v-bind="markerConfig" @update:latLng="$emit('update', $event)" @click="performAction">
    <l-tooltip v-if="config.label">
      {{config.label}}
    </l-tooltip>
  </l-circle>
</template>

<script>
import mixin from '../widget-mixin'
import { LCircle, LTooltip } from 'vue2-leaflet'
import { actionGroup, actionProps, actionsMixin } from '../widget-actions'

export default {
  mixins: [mixin, actionsMixin],
  components: {
    LCircle,
    LTooltip
  },
  widget: {
    name: 'oh-map-circle-marker',
    label: 'Circle Marker',
    icon: 'map_pin_ellipse',
    description: 'A circle on a map, to represent a radius',
    props: {
      parameterGroups: [
        actionGroup(null, 'Action to perform when the circle is clicked')
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
          description: 'The Location item this circle will be centered on'
        },
        {
          name: 'location',
          label: 'Fixed location',
          type: 'TEXT',
          context: 'location',
          description: 'The fixed center of the circle if no item is configured or its coordinates are invalid'
        },
        {
          name: 'radiusItem',
          label: 'Radius Item',
          type: 'TEXT',
          context: 'item',
          description: 'The item whose state holds the radius of the circle, in meters'
        },
        {
          name: 'radius',
          label: 'Fixed radius',
          type: 'DECIMAL',
          description: 'The fixed radius of the circle in meters if no item is configured or its state is invalid'
        },
        {
          name: 'color',
          label: 'Circle color',
          type: 'TEXT',
          description: 'The color of the circle (e.g. "blue", "red", "yellow"...)'
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
    center () {
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
    radius () {
      if (this.config.radiusItem) {
        const itemState = this.context.store[this.config.radiusItem]
        if (itemState && !isNaN(parseFloat(itemState.state))) {
          return parseFloat(itemState.state)
        }
      }
      if (this.config.radius) {
        return parseFloat(this.config.radius)
      }
      return null
    },
    markerConfig () {
      if (!this.config) return {}
      let ret = {}
      Object.assign(ret, this.config)
      delete ret.latLng
      delete ret.radius
      return ret
    }
  },
  mounted () {
    this.$emit('update', this.center, this.radius)
  }
}
</script>
