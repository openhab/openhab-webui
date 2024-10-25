<template>
  <addon-card class="addons-swiper" v-if="addonsList.length === 1" style="width: 66.667%" :addon="addonsList[0]" :install-action-text="installActionText" :headline="headline" @addonButtonClick="addonButtonClick" />
  <f7-swiper class="addons-swiper" v-else pagination :params="{ spaceBetween: 10, slidesPerView: 1.5 }">
    <f7-swiper-slide v-for="addon in addonsList" :key="addon.uid">
      <addon-card :key="addon.uid" :addon="addon" :install-action-text="installActionText" :headline="headline" @addonButtonClick="addonButtonClick" />
    </f7-swiper-slide>
  </f7-swiper>
</template>

<script>
import AddonCard from '@/components/addons/addon-card.vue'

export default {
  props: ['addonsList', 'installActionText', 'headline'],
  emits: ['addonButtonClick'],
  components: {
    AddonCard
  },
  methods: {
    addonButtonClick (addon) {
      this.$emit('addonButtonClick', addon)
    }
  }
}
</script>
