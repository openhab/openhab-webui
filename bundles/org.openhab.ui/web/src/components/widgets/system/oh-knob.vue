<template>
  <round-slider
    v-bind="resolvedConfig"
    :model-value="knobValue"
    @update:model-value="onChange"
    :style="`stroke-dasharray: ${(config.dottedPath) ? config.dottedPath : 0}`"
    mouseScrollAction="true"
    @input="onChange"
    @click.stop="sendCommandDebounced(value, true)"
    @touchend.stop="sendCommandDebounced(value, true)" />
</template>

<script>
import { defineAsyncComponent } from 'vue'

import slideMixin from './slide-mixin'
import { OhKnobDefinition } from '@/assets/definitions/widgets/system'

import { useWidgetContext } from '@/components/widgets/useWidgetContext'

export default {
  mixins: [slideMixin],
  components: {
    // See https://roundsliderui.com/document.html for docs
    RoundSlider: defineAsyncComponent(() => import(/* webpackChunkName: "vue-round-slider" */ 'vue-three-round-slider'))
  },
  props: {
    context: Object
  },
  widget: OhKnobDefinition,
  setup (props) {
    const { config } = useWidgetContext(props.context)
    return { config }
  },
  data () {
    return {
      knobValue: null,
      measuredRadiusPx: null,
      measuredSize: null,
      boundResizeHandler: null,
      gridsterResizeHandler: null,
      resizeObserver: null
    }
  },
  watch: {
    value (newValue) {
      if (!isNaN(newValue)) {
        this.knobValue = this.computeValue(newValue)
      }
    }
  },
  created () {
    if (!isNaN(this.value)) {
      this.knobValue = this.computeValue(this.value)
    } else {
      this.knobValue = this.config.min || 0
    }
  },
  computed: {
    resolvedConfig () {
      const cfg = this.config || {}
      const step = cfg.step !== undefined ? cfg.step : cfg.stepSize
      const size = cfg.size !== undefined ? cfg.size : 100
      // compute radius: explicit > responsive measured px > percentage fallback > numeric size
      let radius
      if (cfg.radius !== undefined) {
        radius = cfg.radius
      } else if (cfg.responsive) {
        radius = this.measuredRadiusPx || (size / 2 + '%')
      } else {
        radius = size / 2
      }

      const rangeColor = cfg.rangeColor !== undefined ? cfg.rangeColor : cfg.primaryColor
      const pathColor = cfg.pathColor !== undefined ? cfg.pathColor : cfg.secondaryColor
      const tooltipColor = cfg.tooltipColor !== undefined ? cfg.tooltipColor : cfg.textColor
      const width = cfg.strokeWidth

      // if startAngle/endAngle provided use them, otherwise use sensible defaults
      const startAngle = cfg.startAngle !== undefined ? cfg.startAngle : -50
      const endAngle = cfg.endAngle !== undefined ? cfg.endAngle : -130

      return {
        ...cfg,
        step,
        radius,
        rangeColor,
        pathColor,
        tooltipColor,
        knobValue: null,
        width,
        startAngle,
        endAngle
      }
    }
  },

  mounted () {
    // If widget is configured to be responsive, measure its container and update on resize
    try {
      const cfg = this.config || {}
      if (cfg.responsive) {
        // initial measurement
        this.updateMeasuredSize()

        // bind handlers so we can remove them later
        this.boundResizeHandler = () => { this.updateMeasuredSize() }
        window.addEventListener('resize', this.boundResizeHandler)

        // some layouts emit a 'gridster-resized' event on this.$root or $root.$el; listen on root Vue instance
        this.gridsterResizeHandler = () => { this.updateMeasuredSize() }
        if (this.$root?.$on) this.$root.$on('gridster-resized', this.gridsterResizeHandler)

        // Use ResizeObserver to watch parent container size changes
        const container = this.$el?.parentElement
        if (container && typeof ResizeObserver !== 'undefined') {
          this.resizeObserver = new ResizeObserver(() => {
            this.updateMeasuredSize()
          })
          this.resizeObserver.observe(container)
        }
      }
    } catch (e) {
      // defensive: don't break if measurement fails
      console.warn('oh-knob: failed to initialize responsive sizing', e)
    }
  },
  beforeUnmount () {
    if (this.boundResizeHandler) window.removeEventListener('resize', this.boundResizeHandler)
    if (this.gridsterResizeHandler && this.$root?.$off) this.$root.$off('gridster-resized', this.gridsterResizeHandler)
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }
  },
  methods: {
    updateMeasuredSize () {
      // measure the component's rendered element and compute an appropriate radius in pixels
      this.$nextTick(() => {
        try {
          const el = this.$el
          const cfg = this.config || {}
          // prefer parent element's inner width/height to keep knob within layout
          const container = el?.parentElement ?? el
          if (!container) return
          const rect = container.getBoundingClientRect()
          // choose smaller dimension to fit circle
          const size = Math.min(rect.width, rect.height)
          if (!size || size <= 0) return
          // Parse cfg.size - if it's a string like "100%" convert to number
          let sizeValue = cfg.size !== undefined ? cfg.size : 100
          if (typeof sizeValue === 'string') {
            const parsed = parseFloat(sizeValue)
            sizeValue = isNaN(parsed) ? 100 : parsed
          }
          // radius for round-slider expects px value or percentage string; use pixels
          const radius = Math.floor(size / 2)
          this.measuredSize = size
          this.measuredRadiusPx = (radius * sizeValue / 100) + 'px'
        } catch (e) {
          console.warn('oh-knob: failed to measure size for responsive layout', e)
        }
      })
    },
    computeValue (value) {
      return (typeof this.config.offset === 'number') ? (value + this.config.offset) : value
    },
    onChange (newValue) {
      if (isNaN(newValue)) return
      if (!['UNDEF', 'NULL'].includes(this.itemState) && isNaN(this.value)) return
      if (typeof this.config.offset === 'number') newValue -= this.config.offset
      this.sendCommandDebounced(newValue)
    }
  }
}
</script>
