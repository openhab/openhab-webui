<template>
  <oh-card
    :context="context"
    :content-class="[
             config.vertical ? 'slider-card-vertical' : '',
             'display-flex',
             'justify-content-center',
           ]">
    <template #content>
      <oh-slider :context="cardChildContext(context.component)" :class="{ 'slider-card-vertical': config.vertical }" />
    </template>
  </oh-card>
</template>

<style lang="stylus">
.slider-card-vertical
  height 300px
</style>

<script>
import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import OhCard from '@/components/widgets/standard/oh-card.vue'
import OhSlider from '../system/oh-slider.vue'
import { OhSliderCardDefinition } from '@/assets/definitions/widgets/standard/cards'

export default {
  props: {
    context: Object
  },
  components: {
    OhCard,
    OhSlider
  },
  widget: OhSliderCardDefinition,
  setup (props) {
    const { config, cardChildContext } = useWidgetContext(props.context)
    return { config, cardChildContext }
  }
}
</script>
