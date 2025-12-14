<template>
  <round-slider v-bind="resolvedConfig"
                :startValue="knobValue"
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

import mixin from '../widget-mixin'
import slideMixin from './slide-mixin'
import { OhKnobDefinition } from '@/assets/definitions/widgets/system'

export default {
  mixins: [mixin, slideMixin],
  components: {
    // See https://roundsliderui.com/document.html for docs
    RoundSlider: defineAsyncComponent(() => import(/* webpackChunkName: "vue-round-slider" */ 'vue-three-round-slider'))
  },
  widget: OhKnobDefinition,
  data () {
    return {
      knobValue: null
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
      const cfg = this.config
      return {
        ...cfg,
        step: cfg.step !== undefined ? cfg.step : cfg.stepSize,
        radius: cfg.radius !== undefined ? cfg.radius : (cfg.responsive ? cfg.size / 2 + '%' : cfg.size / 2),
        rangeColor: cfg.rangeColor !== undefined ? cfg.rangeColor : cfg.primaryColor,
        pathColor: cfg.pathColor !== undefined ? cfg.pathColor : cfg.secondaryColor,
        tooltipColor: cfg.tooltipColor !== undefined ? cfg.tooltipColor : cfg.textColor,
        width: cfg.width !== undefined ? cfg.width : cfg.strokeWidth,
        // eslint-disable-next-line no-constant-binary-expression
        startAngle: !cfg.circleShape !== undefined ? (cfg.startAngle !== undefined ? cfg.startAngle : -50) : null,
        // eslint-disable-next-line no-constant-binary-expression
        endAngle: !cfg.circleShape !== undefined ? (cfg.endAngle !== undefined ? cfg.endAngle : -130) : null
      }
    }
  },
  methods: {
    computeValue (value) {
      return (typeof this.config.offset === 'number') ? (value + this.config.offset) : value
    },
    onChange (newValue) {
      if (isNaN(this.value) || isNaN(newValue)) return
      if (typeof this.config.offset === 'number') newValue -= this.config.offset
      this.sendCommandDebounced(newValue)
    }
  }
}
</script>
