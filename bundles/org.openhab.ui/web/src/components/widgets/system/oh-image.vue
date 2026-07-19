<template>
  <div v-if="config.embedSvg" ref="svgContainer" class="oh-image oh-image-svg" />
  <img
    v-else-if="config.lazy"
    ref="lazyImage"
    v-bind="config"
    :data-src="computedSrc"
    class="oh-image lazy"
    :class="{ 'lazy-fade-in': config.lazyFadeIn }"
    @click="clicked" />
  <img v-else ref="image" v-bind="config" :src="computedSrc" class="oh-image" @click="clicked" />
</template>

<style lang="stylus">
.oh-image-svg
  svg
    display block
    width 100%
    height auto
</style>

<script>
import { nextTick, computed } from 'vue'
import { f7 } from 'framework7-vue'

import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import { OhImageDefinition } from '@/assets/definitions/widgets/system'
import embeddedSvgMixin from '@/components/widgets/svg/oh-embedded-svg-mixin'
import foregroundService from '../widget-foreground-service'
import { useWidgetAction } from '@/components/widgets/useWidgetAction.ts'
import { showToast } from '@/js/dialog-promises'

export default {
  mixins: [foregroundService, embeddedSvgMixin],
  props: {
    context: Object
  },
  widget: OhImageDefinition,
  setup(props) {
    const context = computed(() => props.context)
    const { config, hasAction, evaluateExpression } = useWidgetContext(context)
    // aliased so it doesn't clobber the performAction() method below, which the SVG mixin calls
    const { performAction: runWidgetAction } = useWidgetAction(context, config, evaluateExpression)
    return { config, hasAction, runWidgetAction }
  },
  data() {
    return {
      t: f7.utils.id(),
      src: null,
      ts: 0,
      embeddedSvgToken: 0
    }
  },
  watch: {
    url(val) {
      if (this.config.embedSvg) {
        this.embedWidgetSvg()
        return
      }
      this.$oh.media.getImage(val).then((url) => {
        this.src = url
      })
    },
    'config.embedSvg'(val) {
      if (val) {
        this.embedWidgetSvg()
      } else {
        this.removeWidgetSvg()
        this.startForegroundActivity()
      }
    },
    // re-setup state tracking when the actions config changes (e.g. while live-editing the widget YAML);
    // click handlers read the config at click time and don't need to be reattached
    'config.embeddedSvgActions': {
      deep: true,
      handler() {
        if (!this.embeddedSvgReady) return
        this.unsubscribeEmbeddedSvgStateTracking()
        this.setupEmbeddedSvgStateTracking()
      }
    },
    src(val) {
      if (this.config.lazy)
        nextTick(() => {
          f7.lazy.loadImage(this.$refs.lazyImage)
        })
    },
    itemState(value) {
      if (value) {
        this.loadItemImage()
      }
    }
  },
  computed: {
    url() {
      return this.config.url
    },
    itemState() {
      if (this.config.item) return f7.utils.id() + '|' + this.context.store[this.config.item].state
      return null
    },
    computedSrc() {
      return this.ts && this.src ? (this.src.indexOf('?') === -1 ? `${this.src}?_ts=${this.ts}` : `${this.src}&_ts=${this.ts}`) : this.src
    }
  },
  methods: {
    loadItemImage() {
      this.$oh.api.getPlain(`/rest/items/${this.config.item}/state`, 'text/plain').then((data) => {
        this.src = data
        if (this.config.lazy)
          nextTick(() => {
            f7.lazy.loadImage(this.$refs.lazyImage)
          })
      })
    },
    clicked() {
      if (this.context.component.component !== 'oh-image') return // don't interfere if we're in the context of a oh-image-card for example
      if (this.hasAction) {
        this.runWidgetAction()
      }
    },
    startForegroundActivity() {
      if (this.config.embedSvg) {
        // interactive SVGs are (re)embedded when the page enters the foreground so Item state
        // subscriptions are released while the page is out of view
        this.embedWidgetSvg()
        return
      }
      if (this.config.item) {
        this.loadItemImage()
      } else {
        this.$oh.media.getImage(this.config.url).then((url) => {
          this.src = url
        })
      }
      if (this.config.refreshInterval) {
        this.refreshInterval = setInterval(() => {
          this.ts = new Date().toISOString()
        }, this.config.refreshInterval)
      }
    },
    stopForegroundActivity() {
      if (this.refreshInterval) clearInterval(this.refreshInterval)
      this.removeWidgetSvg()
    },
    // Mixin overrides: the image widget configures the image under `url`, hosts the SVG in its own
    // container, and runs SVG actions itself instead of emitting them to a parent page.
    embeddedSvgUrl() {
      return this.config.url
    },
    embeddedSvgRoot() {
      return this.$refs.svgContainer?.querySelector('svg') || null
    },
    performAction(evt, prefix, config, context) {
      this.runWidgetAction(evt, prefix || '', context, config)
    },
    // There is no popup-based configuration for embedded SVGs in widgets - the embeddedSvgActions
    // are part of the widget YAML - so clicks only act in run mode.
    svgOnClick(el) {
      if (this.context.editmode) return
      const actionConfig = this.config.embeddedSvgActions?.[el.id]
      if (actionConfig) this.performAction(null, null, actionConfig, this.context)
    },
    embedWidgetSvg() {
      this.removeWidgetSvg()
      if (!this.config.url) return
      // invalidation token: an unmount or re-embed bumps it so a stale in-flight fetch is discarded
      const token = ++this.embeddedSvgToken
      return this.fetchEmbeddedSvgText()
        .then((svgCode) => {
          if (token !== this.embeddedSvgToken || !this.$refs.svgContainer) return
          const svgEl = new DOMParser().parseFromString(svgCode, 'image/svg+xml').documentElement
          if (!svgEl || svgEl.tagName.toLowerCase() !== 'svg') {
            return Promise.reject(new Error(`${this.config.url} did not parse to a valid SVG element`))
          }
          // scale with the widget width: derive a viewBox from fixed dimensions, then drop them
          if (!svgEl.getAttribute('viewBox')) {
            const width = parseFloat(svgEl.getAttribute('width'))
            const height = parseFloat(svgEl.getAttribute('height'))
            if (!isNaN(width) && !isNaN(height)) svgEl.setAttribute('viewBox', `0 0 ${width} ${height}`)
          }
          svgEl.removeAttribute('width')
          svgEl.removeAttribute('height')
          svgEl.classList.add('disable-user-drag')
          this.$refs.svgContainer.replaceChildren(svgEl)
          this.subscribeEmbeddedSvgListeners()
          this.setupEmbeddedSvgStateTracking()
          this.embeddedSvgReady = true
        })
        .catch((err) => {
          nextTick(() => {
            showToast('Failed to embed SVG: ' + err)
          })
        })
    },
    removeWidgetSvg() {
      // invalidate any in-flight embed even when nothing is mounted yet
      this.embeddedSvgToken++
      if (!this.embeddedSvgReady) return
      this.unsubscribeEmbeddedSvgListeners()
      this.unsubscribeEmbeddedSvgStateTracking()
      this.$refs.svgContainer?.replaceChildren()
      this.embeddedSvgReady = false
    }
  }
}
</script>
