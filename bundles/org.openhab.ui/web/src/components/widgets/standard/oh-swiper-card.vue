<template>
  <f7-card :no-border="config.noBorder" :no-shadow="config.noShadow" :outline="config.outline">
    <f7-card-header v-if="config.title">
      <div>{{ config.title }}</div>
    </f7-card-header>
    <f7-card-content :class="{ 'slider-card-vertical': config.vertical }">
      <oh-swiper :context="childContext(context.component)" v-on="$listeners" />
    </f7-card-content>
    <oh-card-footer v-if="config.footer" :texts="config.footer" />
  </f7-card>
</template>

<style lang="stylus">
.slider-card-vertical
  height 300px
</style>

<script>
import mixin from '../widget-mixin'
import OhSwiper from '../system/oh-swiper.vue'
import OhCardFooter from '../system/oh-card-footer.vue'
import { OhSwiperCardDefinition } from '@/assets/definitions/widgets/standard/cards'

export default {
  mixins: [mixin],
  components: {
    OhSwiper,
    OhCardFooter
  },
  widget: OhSwiperCardDefinition
}
</script>
