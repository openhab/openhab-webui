<template>
  <round-slider :value="value" :min="config.min" :max="config.max" :step="config.stepSize" :radius="(config.responsive) ? config.size/2 + '%' : config.size/2"
                :style="`stroke-dasharray: ${(config.dottedPath) ? config.dottedPath : 0}`"
                :rangeColor="config.primaryColor" :pathColor="config.secondaryColor"
                :tooltipColor="config.textColor" mouseScrollAction="true"
                :disabled="config.disabled" :width="config.strokeWidth" :line-cap="config.lineCap"
                :startAngle="config.startAngle ? config.startAngle : -50" :endAngle="config.endAngle ? config.endAngle : -130"
                :borderWidth="config.borderWidth" :borderColor="config.borderColor" :circleShape="config.circleShape"
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
  widget: OhKnobDefinition
}
</script>
