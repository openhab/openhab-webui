<template>
  <div>
    <knob-control v-if="!config.useSliderControl" v-bind="config" :text-color="config.textColor || (($f7.data.themeOptions.dark === 'dark') ? '#ffffff' : undefined)" :value="value"
                  @input="sendCommandDebounced($event)" @click.native.stop="sendCommandDebounced(value, true)" @touchend.native.stop="sendCommandDebounced(value, true)" />

    <round-slider v-else :value="value" :min="config.min" :max="config.max" :step="config.stepSize" :radius="config.size/2"
                  :style="`stroke-dasharray: ${(config.dottedPath) ? config.dottedPath : 0}`"
                  :rangeColor="config.primaryColor" :pathColor="config.secondaryColor"
                  :tooltipColor="config.textColor || (($f7.data.themeOptions.dark === 'dark') ? '#ffffff' : undefined)"
                  :disabled="config.disabled" :width="config.strokeWidth" :line-cap="config.lineCap"
                  :startAngle="config.startAngle" :endAngle="config.endAngle"
                  :borderWidth="config.borderWidth" :borderColor="config.borderColor" :circleShape="config.circleShape"
                  @input="sendCommandDebounced($event)" @click.native.stop="sendCommandDebounced(value, true)" @touchend.native.stop="sendCommandDebounced(value, true)" />
  </div>
</template>

<script>
import mixin from '../widget-mixin'
import slideMixin from './slide-mixin'
import { OhKnobDefinition } from '@/assets/definitions/widgets/system'

import KnobControl from 'vue-knob-control'

export default {
  mixins: [mixin, slideMixin],
  components: {
    KnobControl,
    'RoundSlider': () => import(/* webpackChunkName: "vue-round-slider" */ 'vue-round-slider')
  },
  widget: OhKnobDefinition
}
</script>
