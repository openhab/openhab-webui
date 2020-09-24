<template>
  <img :src="iconUrl"
    :style="{
      width: (context && config && config.width) ? config.width + 'px' : (width) ? width + 'px' : 'auto',
      height: (context && config && config.height) ? config.height + 'px' : (height) ? height + 'px' : 'auto' }"
    onload="this.className=''" onerror="this.className='no-icon'" />
</template>

<style lang="stylus">
.no-icon
  visibility hidden !important
</style>

<script>
import mixin from '../widget-mixin'
export default {
  mixins: [mixin],
  props: ['icon', 'width', 'height', 'state'],
  data () {
    return {
      currentState: this.state,
      currentIcon: this.icon,
      iconUrl: null
    }
  },
  watch: {
    state (val) {
      if (val !== this.currentState) {
        this.currentState = val
        this.updateIcon()
      }
    },
    icon (val) {
      if (val !== this.currentIcon) {
        this.currentIcon = val
        this.updateIcon()
      }
    }
  },
  mounted () {
    this.updateIcon()
  },
  methods: {
    updateIcon () {
      this.$oh.media.getIcon((this.context) ? this.config.icon : this.icon, 'svg', (this.context) ? this.config.state : this.currentState).then((url) => {
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
