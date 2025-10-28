<template>
  <addon-card class="addons-swiper addon-card-single"
              v-if="addonsList.length === 1"
              :addon="addonsList[0]"
              :install-action-text="installActionText"
              :headline="headline"
              @addon-button-click="addonButtonClick" />
  <f7-swiper class="addons-swiper"
             v-else
             pagination
             :space-between="10"
             :slides-per-view="slidesPerView"
             :key="slidesPerView">
    <f7-swiper-slide v-for="addon in addonsList" :key="addon.uid">
      <addon-card :key="addon.uid"
                  :addon="addon"
                  :install-action-text="installActionText"
                  :headline="headline"
                  :lazy-logo="false"
                  @addon-button-click="addonButtonClick" />
    </f7-swiper-slide>
  </f7-swiper>
</template>

<style lang="stylus">
.addon-card-single
  max-width 300px
  width 66.667%
  @media (orientation: landscape)
    width 28.571%
</style>

<script>
import AddonCard from '@/components/addons/addon-card.vue'

export default {
  props: {
    addonsList: Array,
    installActionText: String,
    headline: String
  },
  emits: ['addon-button-click'],
  components: {
    AddonCard
  },
  computed: {
    slidesPerView () {
      if (this.$f7dim.width > this.$f7dim.height) return 3.5
      return 1.5
    }
  },
  methods: {
    addonButtonClick (addon) {
      this.$emit('addon-button-click', addon)
    }
  }
}
</script>
