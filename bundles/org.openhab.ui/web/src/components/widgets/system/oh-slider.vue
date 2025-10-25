<template>
  <f7-range ref="rangeslider"
            class="oh-slider"
            v-bind="config"
            :value="sliderValue"
            :format-label="formatLabel"
            :format-scale-label="formatScaleLabel"
            @range:change="onChange($event)"
            @click.stop="sendCommandDebounced(sliderValue, true)"
            @touchend="sendCommandDebounced(sliderValue, true)" />
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
  data () {
    return {
      sliderValue: null
    }
  },
  watch: {
    value (newValue) {
      if (!isNaN(newValue)) {
        this.sliderValue = newValue
      }
    }
  },
  created () {
    if (!isNaN(this.value)) {
      this.sliderValue = this.value
    } else {
      this.sliderValue = this.config.min || this.config.max || 0
    }
  },
  mounted () {
    // f7-range inside of masonry can get rendered faulty, as the masonry changes its breakpoint layout after being rendered
    // re-calculate the range slider after masonry is updated
    setTimeout(() => {
      if (this.$refs.rangeslider) {
        this.$refs.rangeslider.$el.f7Range.calcSize()
        this.$refs.rangeslider.$el.f7Range.layout()
      }
    }, 0)
  },
  methods: {
    formatLabel (value) {
      return this.toStepFixed(value) + (this.unit ? ' ' + this.unit : '')
    },
    formatScaleLabel (value) {
      return this.toStepFixed(value)
    },
    toStepFixed (value) {
      // uses the number of decimals in the step config to round the provided number
      const nbDecimals = this.config.step ? Number(this.config.step).toString().replace(',', '.').split('.')[1]?.length : 0
      return parseFloat(Number(value).toFixed(nbDecimals ?? 0))
    },
    onChange (newValue) {
      if (isNaN(this.value)) return
      const tsf = this.toStepFixed(newValue)
      // Do NOT send command if sliderValue is smaller than real value +-step
      if (Math.abs(tsf - this.value) < (this.config.step || 1)) {
        this.$refs.rangeslider.$el.f7Range.setValue(this.value)
      } else {
        this.sendCommandDebounced(tsf)
      }
    }
  }
}
</script>
