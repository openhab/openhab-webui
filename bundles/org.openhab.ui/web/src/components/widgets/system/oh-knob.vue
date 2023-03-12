<template>
  <round-slider v-bind="resolvedConfig" :value="value" :style="`stroke-dasharray: ${(config.dottedPath) ? config.dottedPath : 0}`" mouseScrollAction="true"
                @input="sendCommandDebounced($event)" @click.native.stop="sendCommandDebounced(value, true)" @touchend.native.stop="sendCommandDebounced(value, true)" />
</template>

<script>
import mixin from '../widget-mixin'
import slideMixin from './slide-mixin'
import { OhKnobDefinition } from '@/assets/definitions/widgets/system'

export default {
  mixins: [mixin, slideMixin],
  components: {
    // See https://roundsliderui.com/document.html for docs
    'RoundSlider': () => import(/* webpackChunkName: "vue-round-slider" */ 'vue-round-slider')
  },
  widget: OhKnobDefinition,
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
        startAngle: !cfg.circleShape !== undefined ? (cfg.startAngle !== undefined ? cfg.startAngle : -50) : null,
        endAngle: !cfg.circleShape !== undefined ? (cfg.endAngle !== undefined ? cfg.endAngle : -130) : null
      }
    }
  }
}
</script>
