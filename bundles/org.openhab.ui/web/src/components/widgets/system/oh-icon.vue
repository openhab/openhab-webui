<template>
  <img v-if="iconType === 'oh'"
       :src="iconUrl"
       v-bind="config"
       @click="performAction()"
       :style="{
         width: (resolvedConfig.width !== null) ? resolvedConfig.width + 'px' : 'auto',
         height: (resolvedConfig.height !== null) ? resolvedConfig.height + 'px' : 'auto',
         cursor: (hasAction) ? 'pointer' : 'auto',
         ...resolvedStyle }"
       onload="this.classList.remove('no-icon')"
       onerror="this.classList.add('no-icon')">
  <f7-link v-else-if="hasAction" @click="performAction()">
    <f7-icon v-if="iconType === 'f7'"
             v-bind="resolvedConfig"
             :size="resolvedConfig.width || resolvedConfig.height || null"
             :style="resolvedStyle" />
    <iconify-icon v-else-if="iconType === 'iconify'"
                  v-bind="resolvedConfig"
                  :icon="resolvedIcon.iconName"
                  :style="resolvedStyle" />
  </f7-link>
  <f7-icon v-else-if="iconType === 'f7'"
           v-bind="resolvedConfig"
           :size="resolvedConfig.width || resolvedConfig.height || null"
           :style="resolvedStyle" />
  <iconify-icon v-else-if="iconType === 'iconify'"
                v-bind="resolvedConfig"
                :icon="resolvedIcon.iconName"
                :style="resolvedStyle" />
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
  props: ['icon', 'width', 'height', 'color', 'state', 'rotate', 'horizontalFlip', 'verticalFlip'],
  widget: OhIconDefinition,
  data () {
    return {
      currentState: this.state,
      currentIcon: null,
      iconUrl: null
    }
  },
  computed: {
    resolvedStyle () {
      return {
        ...(this.config && this.config.style) ? this.config.style : {}
      }
    },
    resolvedConfig () {
      return {
        width: (this.width) ? this.width : (this.config && this.config.width) ? this.config.width : null,
        height: (this.height) ? this.height : (this.config && this.config.height) ? this.config.height : null,
        color: (this.color) ? this.color : (this.config && this.config.color) ? this.config.color : null,
        rotate: (this.rotate) ? this.rotate : (this.config && this.config.rotate) ? this.config.rotate : null,
        horizontalFlip: (this.horizontalFlip) ? this.horizontalFlip : (this.config && this.config.horizontalFlip) ? this.config.horizontalFlip : null,
        verticalFlip: (this.verticalFlip) ? this.verticalFlip : (this.config && this.config.verticalFlip) ? this.config.verticalFlip : null,
        ios: (this.icon) ? this.icon : (this.config && this.config.icon) ? this.config.icon : null,
        md: (this.icon) ? this.icon : (this.config && this.config.icon) ? this.config.icon : null,
        aurora: (this.icon) ? this.icon : (this.config && this.config.icon) ? this.config.icon : null
      }
    },
    resolvedIcon () {
      let iconName = (this.context) ? this.config.icon : this.icon
      if (!(typeof iconName === 'string' || iconName instanceof String)) {
        iconName = ''
      } else if (iconName.indexOf('oh:') === 0 && iconName.split(':').length === 3) {
        iconName = iconName.split(':')[2]
      } else if (iconName.indexOf(':') >= 0) {
        iconName = iconName.substring(iconName.indexOf(':') + 1)
      }
      // for OH icons only
      const actualState = (this.context) ? this.config.state : this.state
      return {
        iconName,
        actualState
      }
    },
    iconType () {
      const icon = (this.context) ? this.config.icon : this.icon
      if (!icon) return 'oh'
      if (!(typeof icon === 'string' || icon instanceof String)) return 'oh'
      if (icon.indexOf('f7') === 0 || icon.indexOf('material') === 0) return 'f7'
      if (icon.indexOf('if') === 0 || icon.indexOf('iconify') === 0) return 'iconify'
      return 'oh'
    },
    /**
     * Icon set, for openHAB icons only.
     * Defaults to 'classic'.
     * @returns {*|string}
     */
    iconSet () {
      const icon = (this.context) ? this.config.icon : this.icon
      if (icon.indexOf('oh:') === 0 && icon.split(':').length === 3) return icon.split(':')[1]
      return 'classic'
    },
    // for OH icons only
    iconFormat () {
      return (this.context) ? (this.config.iconFormat || 'svg') : 'svg'
    }
  },
  watch: {
    resolvedIcon (val) {
      let updated = false
      if (val.actualState !== this.currentState) {
        this.currentState = val.actualState
        updated = true
      }
      if (val.iconName !== this.currentIcon) {
        this.currentIcon = val.iconName
        updated = true
      }
      if (updated && this.iconType === 'oh') this.updateIcon()
    }
  },
  mounted () {
    this.currentIcon = this.resolvedIcon.iconName
    this.currentState = this.resolvedIcon.actualState
    if (this.iconType === 'oh') this.updateIcon()
  },
  methods: {
    updateIcon () {
      if (!this.currentIcon) {
        this.iconUrl = null
        return
      }
      this.$oh.media.getIcon(this.currentIcon, this.iconFormat, this.currentState, this.iconSet).then((url) => {
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
