<template>
  <oh-card :context="context" :content-class="['no-padding']">
    <template #content>
      <oh-swiper :context="cardChildContext(context.component)" />
    </template>
  </oh-card>
</template>

<script>
import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import OhCard from '@/components/widgets/standard/oh-card.vue'
import OhSwiper from '../system/oh-swiper.vue'
import { OhSwiperCardDefinition } from '@/assets/definitions/widgets/standard/cards'

export default {
  props: {
    context: Object
  },
  components: {
    OhCard,
    OhSwiper
  },
  widget: OhSwiperCardDefinition,
  setup (props) {
    const { cardChildContext } = useWidgetContext(props.context)
    return { cardChildContext }
  }
}
</script>
