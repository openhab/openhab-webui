<template>
  <q-carousel class="hb-carousel full-width" :class="{'highlight-and-fade': this.model.highlight}"
    :arrows="model.config.arrows" :infinite="model.config.infinite" :autoplay="model.config.autoplay"
    :quick-nav="model.config.quickNav" :no-swipe="model.config.noSwipe" :color="model.config.color">
    <q-carousel-slide v-if="model.slots.slides" v-for="(slide,idx) in model.slots.slides" :key="'slide-' + idx">
      <component :is="slide.component" :model="slide" />
    </q-carousel-slide>
  </q-carousel>
</template>

<style lang="stylus">
.hb-carousel .q-carousel-slide
  padding 0
</style>

<script>
import HbImage from './HbImage.vue'
import HbChartImage from './HbChartImage.vue'
import HbContainer from './HbContainer.vue'

export default {
  name: 'HbCarousel',
  props: ['model'],
  components: {
    HbImage,
    HbChartImage,
    HbContainer
  },
  computed: {
  }
}
</script>
