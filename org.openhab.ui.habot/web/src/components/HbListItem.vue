<template>
<q-item :tag="tag" :class="{'highlight-and-fade': this.model.highlight}">
  <q-item-side v-if="model.config.leftIcon || model.config.leftLetter || model.config.leftAvatar"
    :icon="leftIcon" :letter="leftLetter" :avatar="this.model.config.leftAvatar" :color="leftColor" :inverted="this.model.config.leftInverted" />
  <q-item-main>
    <q-item-tile label>{{label}}</q-item-tile>
    <q-item-tile v-if="sublabel" class="q-card-subtitle item-subtitle" sublabel>{{sublabel}}</q-item-tile>
    <hb-slider :model="{ config: { item: item.name } }" v-if="item && (item.type === 'Dimmer' || item.type === 'Color')"></hb-slider>
  </q-item-main>
  <q-item-side right>
    <hb-color-picker :model="{ config: { item: item.name } }" v-if="item && (item.type === 'Color')"></hb-color-picker>
    <hb-switch :model="{ config: { item: item.name } }" v-if="item && (item.type === 'Switch' || (item.type === 'Dimmer' && item.tags.indexOf('capability:Switchable') >= 0) || item.type === 'Color')"></hb-switch>
    <hb-shutter-control v-else-if="item && item.type === 'Rollershutter'" class="text-black" style="margin-top: -2px; margin-bottom: -2px"
        :model="{ config: { item: item.name, rounded: true, dense: true, push: true, size: 'lg', stopIcon: 'close', glossy: true } }"></hb-shutter-control>
    <big v-else class="big-value">{{state}}</big>
  </q-item-side>
</q-item>
</template>

<style lang="stylus" scoped>
.item-subtitle
  font-size 14px !important
  // color rgba(0,0,0,0.4) !important
.big-value
  font-weight 300
  color black
  font-size 150%
.q-card-dark .big-value
  color white
</style>

<script>
import HbSwitch from 'components/HbSwitch.vue'
import HbSlider from 'components/HbSlider.vue'
import HbShutterControl from 'components/HbShutterControl.vue'

export default {
  props: ['model', 'link'],
  components: {
    HbSwitch,
    HbSlider,
    HbShutterControl
  },
  data () {
    return {
      config: this.model.config
    }
  },
  created () {
  },
  computed: {
    tag: {
      get () {
        return (this.link && this.item && this.item.type === 'Switch' ? 'label' : 'div')
      }
    },
    item: {
      get () {
        if (this.model.config.item) {
          return this.$store.getters['items/name'](this.model.config.item)
        }
      }
    }
  },
  asyncComputed: {
    label: {
      get () {
        return this.$expr(this.model.config.label)
      }
    },
    sublabel: {
      get () {
        if (this.model.config.sublabel) {
          return this.$expr(this.model.config.sublabel)
        } else if (this.model.config.item) {
          return this.model.config.item
        }
      }
    },
    state: {
      get () {
        if (this.model.config.item) {
          return Promise.resolve(this.$store.getters['items/itemState'](this.model.config.item))
        } else if (this.model.config.state) {
          return this.$expr(this.model.config.state)
        }
      }
    },
    leftIcon () {
      return this.$expr(this.model.config.leftIcon)
    },
    leftLetter () {
      return this.$expr(this.model.config.leftLetter)
    },
    leftColor () {
      return this.$expr(this.model.config.leftColor)
    }
  }
}
</script>
