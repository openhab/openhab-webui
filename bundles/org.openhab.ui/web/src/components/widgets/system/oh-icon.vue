<template>
  <img v-if="iconType === 'oh'"
       :src="iconUrl" v-bind="config" @click="performAction()"
       :style="{
         width: (context && config && config.width) ? config.width + 'px' : (width) ? width + 'px' : 'auto',
         height: (context && config && config.height) ? config.height + 'px' : (height) ? height + 'px' : 'auto',
         ...(config) ? config.style : {} }"
       onload="this.classList.remove('no-icon')" onerror="this.classList.add('no-icon')">
  <f7-icon v-else-if="iconType === 'f7'"
           :ios="icon || ((config) ? config.icon : null)" :md="icon || ((config) ? config.icon : null)" :aurora="icon || ((config) ? config.icon : null)"
           :color="color || ((config) ? config.color : null)" :size="width || height || ((config) ? (config.width || config.height) : null)"
           :style="(config) ? config.style : null" />
  <iconify-icon v-else-if="iconType === 'iconify'"
                :icon="iconName"
                :width="width || ((config) ? config.width : null)" :height="height || ((config) ? config.height : null)"
                :color="color || ((config) ? config.color : null)" :rotate="rotate || ((config) ? config.rotate : null)"
                :horizontal-flip="horizontalFlip || ((config) ? config.horizontalFlip : null)"
                :vertical-flip="verticalFlip || ((config) ? config.verticalFlip : null)"
                :style="(config) ? config.style : null" />
</template>

<style lang="stylus">
.no-icon
  visibility hidden !important
</style>

<script>
import mixin from '../widget-mixin'
import { OhIconDefinition } from '@/assets/definitions/widgets/system'
import { actionsMixin } from '../widget-actions'
import { Icon } from '@iconify/vue2'

export default {
  mixins: [mixin, actionsMixin],
  components: {
    'iconify-icon': Icon
  },
  props: ['icon', 'width', 'height', 'color', 'flip', 'state', 'rotate', 'horizontalFlip', 'verticalFlip'],
  widget: OhIconDefinition,
  data () {
    return {
      currentState: this.state,
      currentIcon: this.actualIcon,
      iconUrl: null
    }
  },
  computed: {
    iconType () {
      const icon = (this.context) ? this.config.icon : this.icon
      if (!icon) return 'oh'
      if (!(typeof icon === 'string' || icon instanceof String)) return 'oh'
      if (icon.indexOf('f7') === 0 || icon.indexOf('material') === 0) return 'f7'
      if (icon.indexOf('if') === 0 || icon.indexOf('iconify') === 0) return 'iconify'
      return 'oh'
    },
    iconName () {
      const icon = (this.context) ? this.config.icon : this.icon
      if (!(typeof icon === 'string' || icon instanceof String)) return ''
      if (icon.indexOf('oh:classic:') === 0) return icon.substring(icon.indexOf('oh:classic:') + 11)
      if (icon.indexOf(':') >= 0) return icon.substring(icon.indexOf(':') + 1)
      return icon
    },
    // for OH icons only
    actualState () {
      return (this.context) ? this.config.state : this.state
    },
    // for OH icons only
    iconFormat () {
      return (this.context) ? (this.config.iconFormat || 'svg') : 'svg'
    }
  },
  watch: {
    actualState (val) {
      if (val !== this.currentState) {
        this.currentState = val
        if (this.iconType === 'oh') this.updateIcon()
      }
    },
    iconName (val) {
      if (val !== this.currentIcon) {
        this.currentIcon = val
        if (this.iconType === 'oh') this.updateIcon()
      }
    }
  },
  mounted () {
    this.currentIcon = this.iconName
    this.currentState = this.actualState
    if (this.iconType === 'oh') this.updateIcon()
  },
  methods: {
    updateIcon () {
      if (!this.currentIcon) return
      this.$oh.media.getIcon(this.currentIcon, this.iconFormat, this.currentState).then((url) => {
        if (url !== this.iconUrl) {
          this.iconUrl = url
        }
      })
    }
  }
  // asyncComputed: {
  //   iconUrl () {
  //     return (this.icon)
  //       ? this.$oh.media.getIcon(this.icon, 'svg', this.currentState)
  //       // transparent PNG pixel
  //       : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
  //   }
  // }
}
</script>
