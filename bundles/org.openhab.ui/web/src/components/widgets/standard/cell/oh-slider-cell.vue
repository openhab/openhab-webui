<template>
  <oh-cell class="cell-expanded-thin"
           :context="context"
           :no-swipe-to-close="true"
           :style="{ '--oh-slider-cell-height': config.sliderHeight || '350px' }">
    <f7-row>
      <f7-col width="100" class="cell-slider display-flex flex-direction-column justify-content-center">
        <slot name="beforeSlider">
          <div v-if="context.component.slots"
               class="margin-top display-flex flex-direction-column justify-content-center">
            <generic-widget-component v-for="(slotComponent, idx) in context.component.slots.beforeSlider"
                                      :context="childContext(slotComponent)"
                                      :key="'beforeSlider-' + idx"
                                      @command="onCommand" />
          </div>
        </slot>
        <oh-slider class="slider-control" :context="sliderContext" />
        <div v-if="context.component.slots && context.component.slots.afterSlider" class="after-slider">
          <slot name="afterSlider">
            <generic-widget-component v-for="(slotComponent, idx) in context.component.slots.afterSlider"
                                      :context="childContext(slotComponent)"
                                      :key="'afterSlider-' + idx"
                                      @command="onCommand" />
          </slot>
        </div>
      </f7-col>
    </f7-row>
  </oh-cell>
</template>

<style lang="stylus">
@media (min-width: 768px) and (min-height: 670px)
  .cell-expanded-thin:not(.card-tablet-fullscreen)
    max-width var(--oh-default-cell-tablet-width) !important
.cell-expanded-thin
  --f7-card-expandable-tablet-width 400px
.cell-slider
  --f7-range-bar-bg-color #eeeeee
  --f7-range-scale-text-color #eeeeee
  --f7-range-bar-size 150px
  --f7-range-knob-size 0px
  --f7-range-label-size 60px
  --f7-range-label-font-size 40px
  .slider-control
    position absolute
    top calc(50% - var(--oh-slider-cell-height)/2 + 2rem)
    height var(--oh-slider-cell-height) !important
  .after-slider
    position absolute
    top calc(50% + var(--oh-slider-cell-height)/2 + 2rem)
    left 0
    width 100%
    display flex
    flex-direction column
    align-items center
</style>

<script>
import mixin from '../../widget-mixin'
import { OhSliderCellDefinition } from '@/assets/definitions/widgets/standard/cells'
import OhCell from './oh-cell.vue'
import OhSlider from '../../system/oh-slider.vue'

export default {
  mixins: [mixin],
  components: {
    OhCell,
    OhSlider
  },
  widget: OhSliderCellDefinition,
  computed: {
    sliderContext () {
      return Object.assign({}, this.context, {
        component: {
          component: 'oh-slider',
          config: Object.assign({}, this.context.component.config, {
            vertical: true,
            label: true,
            scale: true
          })
        }
      })
    }
  }
}
</script>
