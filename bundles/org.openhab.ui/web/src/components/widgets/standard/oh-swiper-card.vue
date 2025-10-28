<template>
  <oh-card :context="context" :content-class="['no-padding']">
    <template #content>
      <oh-swiper v-bind="$attrs" :context="childContext(context.component)" />
    </template>
  </oh-card>
</template>

<script>
import mixin from '../widget-mixin'
import OhCard from '@/components/widgets/standard/oh-card.vue'
import OhSwiper from '../system/oh-swiper.vue'
import { OhSwiperCardDefinition } from '@/assets/definitions/widgets/standard/cards'

export default {
  mixins: [mixin],
  components: {
    OhCard,
    OhSwiper
  },
  widget: OhSwiperCardDefinition
}
</script>
