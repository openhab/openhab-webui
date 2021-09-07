<template>
  <f7-link
    v-if="addon"
    class="addon-card padding-right-half" :href="addon.id">
    <div class="addon-card-headline">
      <div>{{ headline || autoHeadline }}</div>
    </div>
    <div class="addon-card-title">
      <div class="addon-card-title-after">
        <f7-preloader v-if="addon.pending" color="blue" />
        <f7-button v-else-if="addon.installed" class="install-button prevent-active-state-propagation" text="Remove" color="red" round small @click="buttonClicked" />
        <f7-button v-else class="install-button prevent-active-state-propagation" text="Install" color="blue" round small @click="buttonClicked" />
      </div>
      <div class="addon-card-label">
        {{ addon.label }}
      </div>
      <div class="addon-card-author">
        {{ addon.author }}
        <f7-icon v-if="addon.verifiedAuthor" size="15" :color="$f7.data.themeOptions.dark === 'dark' ? 'white' : 'blue'" f7="checkmark_seal_fill" style="margin-top: -3px;" />
      </div>
    </div>
    <div class="logo-square">
      <f7-icon v-show="!logoLoaded" size="150" color="gray" :f7="addonIcon" class="card-default-icon" />
      <img v-if="!logoError" class="lazy logo" :style="{ visibility: logoLoaded ? 'visible': 'hidden' }" ref="logo" :data-src="imageUrl">
    </div>
  </f7-link>
</template>

<style lang="stylus">
.addon-card
  display flex
  flex-direction column
  align-items flex-start
  align-content flex-end
  color inherit
  scroll-snap-align center center
  padding 5px 0px 0px
  position relative
  margin-bottom 1rem
  .install-button
    // --f7-button-bg-color var(--f7-color-gray)
    --f7-button-text-transform uppercase
    --f7-button-bg-color var(--f7-list-item-border-color)
  .addon-card-headline
    text-transform uppercase
    color var(--f7-theme-color)
    font-size 11px
    font-weight 500
  .addon-card-title
    height 3.4rem
    width 100%
    /* display flex
    justify-content space-between
    box-sizing border-box */
    font-size var(--f7-timeline-item-title-font-size) // 21px
    font-weight var(--f7-list-media-item-title-font-weight)
    line-height 1.75
    .addon-card-label
      text-overflow ellipsis
      overflow hidden
      white-space nowrap
      width calc(100% - 5rem)
    .addon-card-title-after
      .preloader-inner .preloader-inner-left, .preloader-inner .preloader-inner-right, .preloader-inner .preloader-inner-line
        margin-left inherit !important
      display flex
      float right
      align-self top
      min-width 70px
      justify-content center
      height var(--f7-button-small-height)
      --f7-preloader-size var(--f7-button-small-height)
  .addon-card-author
    color var(--f7-list-item-after-text-color)
    font-size var(--f7-list-item-subtitle-font-size) // 21px
    font-weight var(--f7-list-item-subtitle-font-weight)
    line-height 1.75
    &:after
      content ' '
      display inline-block
  .logo-square
    position relative
    background #fff
    width 100%
    margin-top 5px
    // height 220px
    border 1px solid var(--f7-list-item-border-color)
    border-radius 5px
    display flex
    justify-content center
    align-items center
    &:after
      content ' '
      display block
      padding-bottom 100%
  .card-default-icon
    opacity 0.2
    position absolute
  .logo
    position absolute
    top 3px
    left 3px
    width calc(100% - 6px)
    height calc(100% - 6px)
    object-fit contain
</style>

<script>
import { AddonIcons } from '@/assets/addon-store'

export default {
  props: ['addon', 'headline'],
  data () {
    return {
      logoLoaded: false,
      logoError: false,
      addonIcon: null
    }
  },
  computed: {
    autoHeadline () {
      if (this.addon.properties && this.addon.properties.like_count && this.addon.properties.like_count >= 20) return 'Top'
      if (this.addon.properties && this.addon.properties.views && this.addon.properties.views >= 1000) return 'Popular'
      if (this.addon.properties && this.addon.properties.posts_count && this.addon.properties.posts_count >= 15) return 'Hot'
      return ''
    },
    imageUrl () {
      if (this.addon.imageLink) return this.addon.imageLink.replace(/^\/\//, 'https://')
      return 'https://www.openhab.org/logos/' + this.addon.id.substring(this.addon.id.indexOf('-') + 1) + '.png'
    }
  },
  mounted () {
    this.addonIcon = AddonIcons[this.addon.type]
    this.$$(this.$refs.logo).once('lazy:loaded', (e) => {
      console.log(this.addon.id + ' logo lazy loaded')
      this.logoLoaded = true
    })
    this.$$(this.$refs.logo).once('lazy:error', (e) => {
      this.logoError = true
    })
  },
  methods: {
    buttonClicked () {
      this.$emit('addonButtonClick', this.addon)
    }
  }
}
</script>
