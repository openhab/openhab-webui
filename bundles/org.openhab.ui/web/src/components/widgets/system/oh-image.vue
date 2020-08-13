<template>
  <img v-if="config.lazy" ref="lazyImage" v-bind="config" :data-src="src" class="oh-image lazy" :class="{ 'lazy-fade-in': config.lazyFadeIn }" />
  <img v-else ref="image" v-bind="config" :src="src" class="oh-image" />
</template>

<style lang="stylus">

</style>

<script>
import mixin from '../widget-mixin'

export default {
  mixins: [mixin],
  data () {
    return {
      t: this.$utils.id(),
      src: null
    }
  },
  watch: {
    itemState (value) {
      if (value) {
        this.loadItemImage()
      }
    }
  },
  computed: {
    itemState () {
      if (this.config.item) return this.$utils.id() + '|' + this.context.store[this.config.item].state
      return null
    }
  },
  mounted () {
    if (this.config.item) {
      this.loadItemImage()
    } else {
      this.src = this.$oh.media.getImage(this.config.url)
      if (this.config.lazy) this.$nextTick(() => { this.$f7.lazy.loadImage(this.$refs.lazyImage) })
    }
  },
  methods: {
    loadItemImage () {
      this.$oh.api.getPlain(`/rest/items/${this.config.item}/state`, 'text/plain').then((data) => {
        this.src = data
        if (this.config.lazy) this.$nextTick(() => { this.$f7.lazy.loadImage(this.$refs.lazyImage) })
      })
    }
  }
}
</script>
