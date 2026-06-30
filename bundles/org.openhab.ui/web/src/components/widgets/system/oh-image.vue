<template>
  <img
    v-if="config.lazy"
    ref="lazyImage"
    v-bind="config"
    :data-src="computedSrc"
    class="oh-image lazy"
    :class="{ 'lazy-fade-in': config.lazyFadeIn }"
    @click="clicked" />
  <div v-else-if="config.embedSvg" ref="imageContainer" class="disable-user-select"></div>
  <img v-else ref="image" v-bind="config" :src="computedSrc" class="oh-image" @click="clicked" />
</template>

<script>
import { ref, watch, nextTick, computed, useTemplateRef, toRef } from 'vue'
import { f7 } from 'framework7-vue'

import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import { OhImageDefinition } from '@/assets/definitions/widgets/system'
import foregroundService from '../widget-foreground-service'
import { useWidgetAction } from '@/components/widgets/useWidgetAction.ts'
import { useSvgEmbedded } from '@/components/widgets/svg/useSvgEmbedded.ts'

import media from '@/js/openhab/media'
import * as api from '@/api'

export default {
  mixins: [foregroundService],
  props: {
    context: Object
  },
  widget: OhImageDefinition,
  setup(props) {
    const context = computed(() => props.context)
    const { config, hasAction, evaluateExpression } = useWidgetContext(context)
    const { performAction } = useWidgetAction(context, config, evaluateExpression)

    const imageContainerRef = useTemplateRef('imageContainer')

    const { loadAndEmbedSvg, removeEmbeddedSvg } = useSvgEmbedded({
      editmode: computed(() => Boolean(context.value.editmode)),
      embeddedSvgActions: toRef(config.value.embeddedSvgActions || {}),
      embedSvgFlashing: toRef(config.value.embedSvgFlashing || false),
      performAction: (event, prefix, config) => performAction(event ?? undefined, prefix, context.value, config)
    })

    return { config, hasAction, performAction, loadAndEmbedSvg, removeEmbeddedSvg, imageContainerRef }
  },
  data() {
    return {
      t: f7.utils.id(),
      src: null,
      ts: 0
    }
  },
  watch: {
    url(val) {
      this.loadUrlImage(val)
    },
    src(val) {
      if (this.config.lazy)
        nextTick(() => {
          f7.lazy.loadImage(this.$refs.lazyImage)
        })
    },
    itemState(value) {
      if (value) {
        this.loadItemImage(this.config.item)
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
    async loadItemImage(item) {
      const urlOrData = await api.getItemState1({ itemName: item }, { parseAs: 'text' })
      // we currently don't implement embedSvb when the item is a data:image
      if (this.config.embedSvg) {
        if (urlOrData.startsWith('data:image')) {
          console.warn('embedSvg is not supported for data:image URLs. Please use a URL instead.')
        } else {
          this.removeEmbeddedSvg()
          this.loadAndEmbedSvg(urlOrData, this.imageContainerRef)
        }
      } else {
        this.src = urlOrData
        if (this.config.lazy) {
          nextTick(() => {
            f7.lazy.loadImage(this.$refs.lazyImage)
          })
        }
      }
    },
    async loadUrlImage(url) {
      if (this.config.embedSvg) {
        this.removeEmbeddedSvg()
        this.loadAndEmbedSvg(url, this.imageContainerRef)
      } else {
        media.getImage(url).then((imageData) => {
          this.src = imageData
        })
      }
    },
    clicked() {
      if (this.context.component.component !== 'oh-image') return // don't interfere if we're in the context of a oh-image-card for example
      if (this.hasAction) {
        this.performAction()
      }
    },
    startForegroundActivity() {
      if (this.config.item) {
        this.loadItemImage(this.config.item)
      } else {
        this.loadUrlImage(this.url)
      }

      if (this.config.refreshInterval) {
        this.refreshInterval = setInterval(() => {
          this.ts = new Date().toISOString()
        }, this.config.refreshInterval)
      }
    },
    stopForegroundActivity() {
      if (this.refreshInterval) clearInterval(this.refreshInterval)
    }
  }
}
</script>
