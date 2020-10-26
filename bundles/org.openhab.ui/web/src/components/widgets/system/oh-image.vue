<template>
  <img v-if="config.lazy" ref="lazyImage" v-bind="config" :data-src="src" class="oh-image lazy" :class="{ 'lazy-fade-in': config.lazyFadeIn }" @click="clicked" />
  <img v-else ref="image" v-bind="config" :src="src" class="oh-image" @click="clicked" />
</template>

<style lang="stylus">

</style>

<script>
import mixin from '../widget-mixin'
import { actionsMixin } from '../widget-actions'
import { OhImageDefinition } from '@/assets/definitions/widgets/system'

export default {
  mixins: [mixin, actionsMixin],
  widget: OhImageDefinition,
  data () {
    return {
      t: this.$utils.id(),
      src: null
    }
  },
  watch: {
    url (val) {
      this.src = this.$oh.media.getImage(val)
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
    }
  },
  mounted () {
    if (this.config.item) {
      this.loadItemImage()
    } else {
      this.src = this.$oh.media.getImage(this.config.url)
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
      if (this.config.action || this.config.actionPropsParameterGroup) {
        this.performAction()
      }
    }
  }
}
</script>
