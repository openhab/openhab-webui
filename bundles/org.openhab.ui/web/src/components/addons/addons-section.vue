<template>
  <f7-block class="addons-section" ref="addongroup" v-if="addons && addons.length > 0">
    <f7-block-title medium>
      {{ title }}
      <!-- <f7-link v-if="canExpand" color="blue" class="see-all-button margin-right" @click="expand">
        Show All
      </f7-link> -->
    </f7-block-title>
    <f7-block-footer v-if="subtitle">
      {{ subtitle }}
    </f7-block-footer>
    <template v-if="featuredAddons?.length > 0">
      <addons-swiper v-if="!$device.desktop" :addons-list="featuredAddons" :install-action-text="installActionText" :headline="'Featured'" @addonButtonClick="addonButtonClick" />
      <div v-else class="addons-cards">
        <addon-card class="addon-card-desktop" v-for="addon in featuredAddons" :key="addon.uid" :addon="addon" :install-action-text="installActionText" :headline="'Featured'" @addonButtonClick="addonButtonClick" />
      </div>
    </template>
    <template v-if="suggested">
      <addons-swiper v-if="!$device.desktop" :addons-list="addonsList" :install-action-text="installActionText" :headline="'Suggested'" @addonButtonClick="addonButtonClick" />
      <div v-else class="addons-cards">
        <addon-card class="addon-card-desktop" v-for="addon in addonsList" :key="addon.uid" :addon="addon" :install-action-text="installActionText" :headline="'Suggested'" @addonButtonClick="addonButtonClick" />
      </div>
    </template>
    <template v-else-if="showAsCards">
      <addons-swiper v-if="!$device.desktop && !canExpand" :addons-list="addonsList" :install-action-text="installActionText" @addonButtonClick="addonButtonClick" />
      <div v-else class="addons-cards">
        <addon-card class="addon-card-desktop" v-for="addon in addonsList" :key="addon.uid" :addon="addon" :install-action-text="installActionText" @addonButtonClick="addonButtonClick" />
      </div>
    </template>
    <f7-list v-else media-list ref="addonlist" class="addons-table-list" no-chevron no-hairlines>
      <addon-list-item v-for="addon in addonsList" :key="addon.uid" :addon="addon" :install-action-text="installActionText" @addonButtonClick="addonButtonClick" />
    </f7-list>
    <f7-block v-if="canExpand" class="display-flex justify-content-center">
      <f7-button class="" outline color="blue" @click="expand" :text="`Show ${addons.length - addonCollapsedLimit} More`" />
    </f7-block>
  </f7-block>
</template>

<style lang="stylus">
.addons-section
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
    padding-left calc(var(--f7-safe-area-left) + var(--f7-list-item-padding-horizontal))
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
    display flex
    flex-direction row
    align-content flex-start
    align-items flex-end
    flex-wrap wrap
    gap 10px
    .addon-card-desktop
      width 100%
      @media (min-width: 450px)
        width calc(50% - 10px)
      @media (min-width: 600px)
        width calc(33.333% - 10px)
      @media (min-width: 800px)
        width calc(25% - 10px)
      @media (min-width: 1250px)
        width calc(20% - 10px)
      @media (min-width: 1600px)
        width: calc(16.667% - 10px)
</style>

<script>
import AddonListItem from './addon-list-item.vue'
import AddonCard from './addon-card.vue'
import { compareAddons } from '@/assets/addon-store'
import AddonsSwiper from '@/components/addons/addons-swiper.vue'

export default {
  props: ['addons', 'title', 'subtitle', 'showAll', 'featured', 'showAsCards', 'suggested', 'installActionText'],
  components: {
    AddonsSwiper,
    AddonListItem,
    AddonCard
  },
  data () {
    return {
      collapsed: true
    }
  },
  computed: {
    featuredAddons () {
      if (this.featured) {
        return this.addons.filter(a => this.featured.indexOf(a.uid) >= 0).sort(compareAddons)
      }
      return null
    },
    notFeaturedAddons () {
      return (this.featuredAddons && this.featuredAddons.length)
        ? this.addons.filter(a => this.featuredAddons.indexOf(a) < 0).sort(compareAddons)
        : [...this.addons].sort(compareAddons)
    },
    addonCollapsedLimit () {
      const installedCount = this.notFeaturedAddons.filter(a => a.installed).length
      if (installedCount >= 22) return 36
      if (installedCount >= 10) return 24
      return 12
    },
    addonsList () {
      if (this.collapsed) return this.notFeaturedAddons.slice(0, this.addonCollapsedLimit)
      return this.notFeaturedAddons
    },
    canExpand () {
      if (!this.collapsed) return false
      if (this.addons.length < this.addonCollapsedLimit) return false
      return true
    }
  },
  methods: {
    expand () {
      this.collapsed = false
      setTimeout(() => {
        this.$f7.lazy.create('.page-addon-store')
      }, 100)
    },
    addonButtonClick (addon) {
      this.$emit('addonButtonClick', addon)
    }
  },
  mounted () {
    if (this.showAll) this.expand()
  }
}
</script>
