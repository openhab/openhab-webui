<template>
  <img v-if="config.lazy"
       ref="lazyImage"
       v-bind="config"
       :data-src="computedSrc"
       class="oh-image lazy"
       :class="{ 'lazy-fade-in': config.lazyFadeIn }"
       @click="clicked">
  <img v-else
       ref="image"
       v-bind="config"
       :src="computedSrc"
       class="oh-image"
       @click="clicked">
</template>

<style lang="stylus">

</style>

<script>
import mixin from '../widget-mixin'
import { actionsMixin } from '../widget-actions'
import { OhImageDefinition } from '@/assets/definitions/widgets/system'
import foregroundService from '../widget-foreground-service'

export default {
  mixins: [mixin, actionsMixin, foregroundService],
  widget: OhImageDefinition,
  data () {
    return {
      t: this.$utils.id(),
      src: null,
      ts: 0
    }
  },
  watch: {
    url (val) {
      this.$oh.media.getImage(val).then((url) => {
        this.src = url
      })
    },
    src (val) {
      if (this.config.lazy) this.$nextTick(() => { this.$f7.lazy.loadImage(this.$refs.lazyImage) })
    },
    itemState (value) {
      if (value) {
        this.loadItemImage()
      }
    }
  },
  computed: {
    url () {
      return this.config.url
    },
    itemState () {
      if (this.config.item) return this.$utils.id() + '|' + this.context.store[this.config.item].state
      return null
    },
    computedSrc () {
      return this.ts && this.src ? this.src.indexOf('?') === -1 ? `${this.src}?_ts=${this.ts}` : `${this.src}&_ts=${this.ts}` : this.src
    }
  },
  methods: {
    loadItemImage () {
      this.$oh.api.getPlain(`/rest/items/${this.config.item}/state`, 'text/plain').then((data) => {
        this.src = data
        if (this.config.lazy) this.$nextTick(() => { this.$f7.lazy.loadImage(this.$refs.lazyImage) })
      })
    },
    clicked () {
      if (this.context.component.component !== 'oh-image') return // don't interfere if we're in the context of a oh-image-card for example
      if (this.hasAction) {
        this.performAction()
      }
    },
    startForegroundActivity () {
      if (this.config.item) {
        this.loadItemImage()
      } else {
        this.$oh.media.getImage(this.config.url).then((url) => {
          this.src = url
        })
      }
      if (this.config.refreshInterval) {
        this.refreshInterval = setInterval(() => { this.ts = (new Date()).toISOString() }, this.config.refreshInterval)
      }
    },
    stopForegroundActivity () {
      if (this.refreshInterval) clearInterval(this.refreshInterval)
    }
  }
}
</script>
