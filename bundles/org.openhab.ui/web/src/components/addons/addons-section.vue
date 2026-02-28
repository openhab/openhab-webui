<template>
  <f7-block v-if="addons && addons.length > 0" class="addons-section" ref="addongroup">
    <f7-block-title medium>
      {{ title }}
      <!-- <f7-link v-if="canExpand" color="blue" class="see-all-button margin-right" @click="expand">
        Show All
      </f7-link> -->
    </f7-block-title>
    <f7-block-footer v-if="subtitle">
      {{ subtitle }}
    </f7-block-footer>
    <template v-if="featuredAddons?.length && featuredAddons?.length > 0">
      <addons-swiper
        v-if="!device.desktop && !device.ipad"
        :addons-list="featuredAddons"
        :install-action-text="installActionText"
        headline="Featured"
        @addon-button-click="addonButtonClick" />
      <div v-else class="addons-cards">
        <addon-card
          v-for="addon in featuredAddons"
          class="addon-card-desktop"
          :key="addon.uid"
          :addon="addon"
          :install-action-text="installActionText"
          :headline="'Featured'"
          @addon-button-click="addonButtonClick" />
      </div>
    </template>
    <template v-if="suggested">
      <addons-swiper
        v-if="!device.desktop && !device.ipad"
        :addons-list="addonsList"
        :install-action-text="installActionText"
        :headline="'Suggested'"
        @addon-button-click="addonButtonClick" />
      <div v-else class="addons-cards">
        <addon-card
          v-for="addon in addonsList"
          class="addon-card-desktop"
          :key="addon.uid"
          :addon="addon"
          :install-action-text="installActionText"
          :headline="'Suggested'"
          @addon-button-click="addonButtonClick" />
      </div>
    </template>
    <template v-else-if="showAsCards">
      <addons-swiper
        v-if="!device.desktop && !device.ipad && (addons.length < addonCollapsedLimit)"
        :addons-list="addonsList"
        :install-action-text="installActionText"
        @addon-button-click="addonButtonClick" />
      <div v-else class="addons-cards">
        <addon-card
          v-for="addon in addonsList"
          class="addon-card-desktop"
          :key="addon.uid"
          :addon="addon"
          :install-action-text="installActionText"
          @addon-button-click="addonButtonClick" />
      </div>
    </template>
    <f7-list v-else media-list ref="addonlist" class="addons-table-list" no-chevron no-hairlines>
      <addon-list-item
        v-for="addon in addonsList"
        :key="addon.uid"
        :addon="addon"
        :install-action-text="installActionText"
        @addon-button-click="addonButtonClick" />
    </f7-list>
    <f7-block v-if="canExpand" class="display-flex justify-content-center">
      <f7-button class="" outline color="blue" @click="expand" :text="`Show ${addons.length - addonCollapsedLimit} More`" />
    </f7-block>
  </f7-block>
</template>

<style lang="stylus">
.addons-section
  .block
    padding-left var(--f7-safe-area-left)
    padding-right var(--f7-safe-area-right)
  margin-top 2rem
  .see-all-button
    float right
    font-size 16px
    font-weight normal
    padding-top 8px
    vertical-align baseline
.addons-table-list
  --f7-list-bg-color transparent
  --f7-list-item-title-white-space normal
  --f7-list-item-text-max-lines 1
  --f7-list-item-text-font-size 13px
  --f7-list-link-pressed-bg-color transparent
  --f7-list-item-title-line-height 1.2
  .item-link .item-inner
    padding-right 0
  .item-content
    padding-left 0px
  ul
    display flex
    flex-shrink 0
    flex-direction row
    align-content flex-start
    flex-wrap wrap
    overflow auto
    scroll-snap-type x mandatory
    scrollbar-width none
    &::-webkit-scrollbar
      display none
      opacity 0
    @media (min-width 768px)
      scroll-padding-left calc(20px + var(--f7-safe-area-left))
    li
      width 100%
      @media (min-width 768px)
        width 50%
      @media (min-width 1281px)
        width 33.333%
      @media (min-width 1601px)
        width 25%
.addons-swiper
    margin-top 1rem
.addons-cards
    margin-top 1rem
    display grid
    grid-gap 10px
    grid-template-columns repeat(auto-fill, minmax(200px, 1fr))
</style>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { f7 } from 'framework7-vue'
import AddonListItem from './addon-list-item.vue'
import AddonCard from './addon-card.vue'
import AddonsSwiper from '@/components/addons/addons-swiper.vue'
import { compareAddons } from '@/assets/addon-store.ts'
import * as api from '@/api'

const device = f7.device

// props
const props = defineProps<{
  addons: api.Addon[]
  title: string
  subtitle: string
  showAll: boolean
  featured: string[]
  showAsCards: boolean
  suggested: boolean
  installActionText?: string
}>()

// emits
const emit = defineEmits<{ (e: 'addon-button-click', addon: api.Addon): void }>()

// data
const collapsed = ref(true)

// computed
const featuredAddons = computed<api.Addon[] | null>(() => {
  if (props.featured) {
    return props.addons
      .filter((a) => props.featured.includes(a.uid))
      .sort(compareAddons)
  }
  return null
})

const notFeaturedAddons = computed<api.Addon[]>(() => {
  const baseList = (featuredAddons.value && featuredAddons.value.length)
    ? props.addons.filter((a) => !featuredAddons.value!.includes(a))
    : [...props.addons]

  return baseList.sort(compareAddons)
})

const addonCollapsedLimit = computed(() => {
  const installedCount = notFeaturedAddons.value.filter((a) => a.installed).length
  if (installedCount >= 22) return 36
  if (installedCount >= 10) return 24
  return 12
})

const addonsList = computed(() => {
  if (collapsed.value) {
    return notFeaturedAddons.value.slice(0, addonCollapsedLimit.value)
  }
  return notFeaturedAddons.value
})

const canExpand = computed(() => {
  if (!collapsed.value) return false
  return props.addons.length > addonCollapsedLimit.value
})

// lifecycle
onMounted(() => {
  if (props.showAll) expand()
})

// methods
const expand = () => {
  collapsed.value = false
  // Small delay to allow DOM updates before F7 re-scans for lazy images
  setTimeout(() => {
    f7.lazy.create('.page-addon-store')
  }, 100)
}

const addonButtonClick = (addon: api.Addon) => emit('addon-button-click', addon)
</script>
