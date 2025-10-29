<template>
  <oh-list-item :context="context" class="slider-listitem">
    <template #after>
      <div>
        {{ value }}
      </div>
    </template>
    <template #footer>
      <div class="padding">
        <generic-widget-component v-bind="$attrs" :context="childContext(sliderComponent)" />
      </div>
    </template>
  </oh-list-item>
</template>

<style lang="stylus">
.slider-listitem
  .item-title
    width 100%
    .item-footer
      height inherit
</style>

<script>
import mixin from '../../widget-mixin'
import OhListItem from './oh-list-item.vue'
import { OhSliderItemDefinition } from '@/assets/definitions/widgets/standard/listitems'

export default {
  components: {
    OhListItem
  },
  mixins: [mixin],
  widget: OhSliderItemDefinition,
  computed: {
    value () {
      return (this.config?.ignoreDisplayState === true) ? this.context.store[this.config.item].state : this.context.store[this.config.item].displayState || this.context.store[this.config.item].state
    },
    sliderComponent () {
      return {
        component: 'oh-slider',
        config: this.config
      }
    }
  }
}
</script>
