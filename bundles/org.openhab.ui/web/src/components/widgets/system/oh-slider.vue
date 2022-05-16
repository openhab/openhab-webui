<template>
  <f7-range ref="rangeslider" class="oh-slider" v-bind="config" :value="value" :format-label="formatLabel" :format-scale-label="formatScaleLabel"
            @range:change="sendCommandDebounced($event)" @click.native.stop="sendCommandDebounced(value, true)" @touchend.native="sendCommandDebounced(value, true)" />
</template>

<style lang="stylus">
.oh-slider
  .range-knob-label
    white-space nowrap
</style>

<script>
import mixin from '../widget-mixin'
import slideMixin from './slide-mixin'
import { OhSliderDefinition } from '@/assets/definitions/widgets/system'

export default {
  mixins: [mixin, slideMixin],
  widget: OhSliderDefinition,
  mounted () {
    // f7-range inside of masonry can get rendered faulty, as the masonry changes its breakpoint layout after being rendered
    // re-calculate the range slider after masonry is updated
    setTimeout(() => {
      if (this.$refs.rangeslider) {
        this.$refs.rangeslider.f7Range.calcSize()
        this.$refs.rangeslider.f7Range.layout()
      }
    }, 0)
  },
  methods: {
    formatLabel (value) {
      return this.toStepFixed(value) + (this.config.unit || '')
    },
    formatScaleLabel (value) {
      return this.toStepFixed(value)
    },
    toStepFixed (value) {
      // uses the number of decimals in the step config to round the provided number
      const nbDecimals = this.config.step ? Number(this.config.step).toString().replace(',', '.').split('.')[1] : 0
      return parseFloat(Number(value).toFixed(nbDecimals))
    }
  }
}
</script>
