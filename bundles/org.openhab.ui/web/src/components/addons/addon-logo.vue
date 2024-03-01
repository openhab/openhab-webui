<template>
  <div>
    <f7-icon v-show="!logoLoaded" :size="size" color="gray" :f7="addonIcon" class="default-icon" style="padding-left: 0; opacity: 0.2; position: absolute" />
    <img v-if="!svgLogoError" class="lazy logo" :style="imgStyle" ref="svgLogo"
         :data-src="imageUrl('svg')">
    <img v-else-if="!pngLogoError" class="logo" :style="imgStyle" ref="pngLogo"
         :src="imageUrl('png')" @load="logoLoaded = true" @error="pngLogoError = true">
  </div>
</template>

<script>
import { AddonIcons } from '@/assets/addon-store'

export default {
  props: ['addon', 'size'],
  data () {
    return {
      addonIcon: AddonIcons[this.addon.type],
      logoLoaded: false,
      svgLogoError: false,
      pngLogoError: false
    }
  },
  computed: {
    imgStyle () {
      return {
        visibility: this.logoLoaded ? 'visible' : 'hidden'
      }
    }
  },
  methods: {
    imageUrl (type) {
      if (this.addon.imageLink) return this.addon.imageLink.replace(/^\/\//, 'https://')
      let docsBranch = 'final'
      if (this.$store.state.runtimeInfo.buildString === 'Release Build') docsBranch = 'final-stable'
      return `https://raw.githubusercontent.com/openhab/openhab-docs/${docsBranch}/images/addons/${this.addon.id}.${type}`
    }
  },
  mounted () {
    this.$$(this.$refs.svgLogo).once('lazy:loaded', (e) => {
      this.logoLoaded = true
    })
    this.$$(this.$refs.svgLogo).once('lazy:error', (e) => {
      this.svgLogoError = true
    })
  }
}
</script>
