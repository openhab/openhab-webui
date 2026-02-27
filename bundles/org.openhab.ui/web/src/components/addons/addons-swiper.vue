<template>
  <addon-card
    v-if="addonsList.length === 1"
    class="addons-swiper addon-card-single"
    :addon="addonsList[0]!"
    :install-action-text="installActionText"
    :headline="headline"
    @addon-button-click="addonButtonClick" />
  <f7-swiper v-else class="addons-swiper" pagination :space-between="10" :slides-per-view="slidesPerView" :key="slidesPerView">
    <f7-swiper-slide v-for="addon in addonsList" :key="addon.uid">
      <addon-card
        :key="addon.uid"
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

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'
import AddonCard from '@/components/addons/addon-card.vue'
import * as api from '@/api'

const instance = getCurrentInstance()
const global = instance?.appContext.config.globalProperties

// props
defineProps<{ addonsList: api.Addon[], installActionText?: string, headline?: string }>()

// emits
const emit = defineEmits(['addon-button-click'])

// computed
const appWidth = computed(() => (global?.$f7dim as { width: number }).width ?? 0)
const appHeight = computed(() => (global?.$f7dim as { height: number }).height ?? 0)
const slidesPerView = computed(() => appWidth.value > appHeight.value ? 3.5 : 1.5)

// methods
const addonButtonClick = (addon: api.Addon) => emit('addon-button-click', addon)
</script>
