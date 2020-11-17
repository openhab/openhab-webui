<template>
  <img :src="iconUrl" v-bind="config" @click="performAction()"
    :style="{
      width: (context && config && config.width) ? config.width + 'px' : (width) ? width + 'px' : 'auto',
      height: (context && config && config.height) ? config.height + 'px' : (height) ? height + 'px' : 'auto',
      ...(config) ? config.style : {} }"
    onload="this.classList.remove('no-icon')" onerror="this.classList.add('no-icon')" />
</template>

<style lang="stylus">
.no-icon
  visibility hidden !important
</style>

<script>
import mixin from '../widget-mixin'
import { OhIconDefinition } from '@/assets/definitions/widgets/system'
import { actionsMixin } from '../widget-actions'

export default {
  mixins: [mixin, actionsMixin],
  props: ['icon', 'width', 'height', 'state'],
  widget: OhIconDefinition,
  data () {
    return {
      currentState: this.state,
      currentIcon: this.actualIcon,
      iconUrl: null
    }
  },
  computed: {
    actualIcon () {
      return (this.context) ? this.config.icon : this.icon
    },
    actualState () {
      return (this.context) ? this.config.state : this.state
    },
    iconFormat () {
      return (this.context) ? (this.config.iconFormat || 'svg') : 'svg'
    }
  },
  watch: {
    actualState (val) {
      if (val !== this.currentState) {
        this.currentState = val
        this.updateIcon()
      }
    },
    actualIcon (val) {
      if (val !== this.currentIcon) {
        this.currentIcon = val
        this.updateIcon()
      }
    }
  },
  mounted () {
    this.currentIcon = this.actualIcon
    this.currentState = this.actualState
    this.updateIcon()
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
