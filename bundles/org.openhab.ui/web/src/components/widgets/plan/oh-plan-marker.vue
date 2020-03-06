<template>
  <l-marker ref="marker" v-if="coords" :key="markerKey" :draggable="context.editmode != undefined" :lat-lng="coords"
      @update:latLng="onMove" @click="onClick">
    <l-tooltip v-if="tooltip && !config.useTooltipAsLabel" :options="tooltipOptions" @click="() => {}">
      <div style="white-space: nowrap" :style="tooltipStyle">{{tooltip}}</div>
    </l-tooltip>
    <l-icon
      :icon-size="[config.iconSize || 40, config.iconSize || 40]">
      <div v-if="config.useTooltipAsLabel" style="white-space: nowrap" :style="tooltipStyle">{{tooltip}}</div>
      <oh-icon v-else-if="config.icon && config.icon.indexOf('oh:') === 0" :icon="config.icon.split(':')[1]" :width="config.iconSize || 40" :height="config.iconSize || 40" :state="config.iconUseState ? state : undefined" />
      <f7-icon v-else-if="config.icon" :color="config.iconColor" :size="config.iconSize || 40" :ios="config.icon" :md="config.icon" :aurora="config.icon"  />
    </l-icon>
    <l-popup v-if="context.editmode != null && !dragging">
      <div class="display-flex">
        <f7-link href="#" class="text-color-blue display-flex flex-direction-column margin-right" @click="context.editmode.configureWidget(context.component, context.parent)" icon-f7="square_pencil">Configure</f7-link>
        <f7-link href="#" class="text-color-blue display-flex flex-direction-column margin-right" @click="context.editmode.editWidgetCode(context.component, context.parent)" icon-f7="doc_text">YAML</f7-link>
        <f7-link href="#" class="text-color-blue display-flex flex-direction-column margin-right" @click="context.editmode.copyWidget(context.component, context.parent)" icon-f7="scissors_alt">Copy</f7-link>
        <f7-link href="#" class="text-color-red display-flex flex-direction-column" @click="context.editmode.removeWidget(context.component, context.parent)" icon-f7="trash">Remove</f7-link>
      </div>
    </l-popup>
  </l-marker>
</template>

<script>
import mixin from '../widget-mixin'
import { LMarker, LTooltip, LIcon, LPopup } from 'vue2-leaflet'
import { actionGroup, actionProps, actionsMixin } from '../widget-actions'

export default {
  mixins: [mixin, actionsMixin],
  components: {
    LMarker,
    LTooltip,
    LIcon,
    LPopup
  },
  widget: {
    name: 'oh-plan-marker',
    label: 'Floor Plan Marker',
    icon: 'map_pin',
    description: 'A marker on a floor plan',
    props: {
      parameterGroups: [
        {
          name: 'icon',
          label: 'Icon'
        },
        {
          name: 'tooltip',
          label: 'Tooltip / Label',
          description: 'You can customize the styles further with CSS attributes in the <code>tooltipStyle</code> parameter (in YAML only)'
        },
        actionGroup(null, 'Action to perform when the marker is clicked')
      ],
      parameters: [
        ...actionProps(),
        {
          name: 'name',
          label: 'Name',
          type: 'TEXT',
          description: 'The name of the marker (for identification)'
        },
        {
          name: 'coords',
          label: 'Coordinates',
          type: 'TEXT',
          description: 'The coordinates of this marker in the floor plan Coordinate Reference System; usually set by dragging the marker at design time'
        },
        {
          name: 'item',
          label: 'Item',
          type: 'TEXT',
          context: 'item',
          description: 'The item whose state to display on this marker'
        },
        {
          name: 'icon',
          label: 'Icon',
          groupName: 'icon',
          type: 'TEXT',
          description: 'Use <code>oh:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://www.openhab.org/docs/configuration/iconsets/classic/">openHAB icon</a>) or <code>f7:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://framework7.io/icons/">Framework7 icon</a>)'
        },
        {
          name: 'iconUseState',
          label: 'Use state to get icon',
          groupName: 'icon',
          type: 'BOOLEAN',
          description: 'Pass the state of the item to get a dynamic icon (for openHAB icons only) - can cause the icon to flicker when the state changes'
        },
        {
          name: 'iconSize',
          label: 'Icon Size',
          groupName: 'icon',
          type: 'NUMBER',
          description: 'Size of the icon in pixels (40 by default)'
        },
        {
          name: 'iconColor',
          label: 'Icon Color',
          groupName: 'icon',
          type: 'TEXT',
          description: 'Color of the icon (for Framework7/Material icons); use expression for dynamic colors'
        },
        {
          name: 'tooltip',
          label: 'Tooltip Text',
          groupName: 'tooltip',
          type: 'TEXT',
          description: 'The tooltip text - leave blank to display the state of the item'
        },
        {
          name: 'tooltipPermanent',
          label: 'Permanent Tooltip',
          groupName: 'tooltip',
          type: 'BOOLEAN',
          description: 'Always display the tooltip'
        },
        {
          name: 'useTooltipAsLabel',
          label: 'Use Tooltip as Label',
          groupName: 'tooltip',
          type: 'BOOLEAN',
          description: 'Put the tooltip text directly over the plan instead of displaying an icon'
        },
        {
          name: 'tooltipFontSize',
          label: 'Tooltip Font Size',
          groupName: 'tooltip',
          type: 'TEXT',
          description: 'Font size of the tooltip text'
        },
        {
          name: 'tooltipColor',
          label: 'Tooltip Color',
          groupName: 'tooltip',
          type: 'TEXT',
          context: 'color',
          description: 'Color of the tooltip'
        }
      ]
    }
  },
  data () {
    return {
      markerKey: 'marker-' + this.$f7.utils.id(),
      dragging: false
    }
  },
  computed: {
    coords () {
      return (this.config.coords) ? this.config.coords.split(',') : [250, 250]
    },
    hasIcon () {
      return this.config.icon
    },
    tooltipOptions () {
      return {
        permanent: this.config.tooltipPermanent
      }
    },
    state () {
      if (this.config.item) {
        return this.context.store[this.config.item].state
      }
      return null
    },
    tooltipStyle () {
      return Object.assign({
        fontSize: this.config.tooltipFontSize,
        color: this.config.tooltipColor
      }, this.config.tooltipStyles)
    }
  },
  asyncComputed: {
    tooltip () {
      if (this.config.tooltip) {
        return this.config.tooltip
      } else if (this.config.item) {
        const itemState = this.context.store[this.config.item]
        if (itemState && itemState.displayState) return itemState.displayState
        return itemState.state
      }
      return null
    }
  },
  methods: {
    onMove (latlng) {
      this.context.component.config.coords = [latlng.lat, latlng.lng].join(',')
    },
    onClick (event) {
      if (this.context.editmode) {
        // this.context.editmode.configureWidget(this.context.component, this.context.parent)
      } else {
        this.performAction(event)
      }
    }
  },
  mounted () {
    this.$emit('update', this.coords)
  }
}
</script>
