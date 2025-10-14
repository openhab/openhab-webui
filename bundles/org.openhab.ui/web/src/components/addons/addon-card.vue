<template>
  <f7-link v-if="addon" class="addon-card" :href="`/addons/${addon.type}/${addon.uid}`">
    <div class="addon-card-inner card">
      <div class="addon-card-headline">
        <div>{{ headline || autoHeadline || '&nbsp;' }}</div>
      </div>
      <div class="addon-card-title">
        <div v-if="showInstallActions" class="addon-card-title-after">
          <f7-preloader v-if="addon.pending" color="blue" />
          <f7-button v-else-if="addon.installed"
                     class="install-button prevent-active-state-propagation"
                     text="Remove"
                     color="red"
                     round
                     small
                     @click="buttonClicked" />
          <f7-button v-else
                     class="install-button prevent-active-state-propagation"
                     :text="installActionText || 'Install'"
                     color="blue"
                     round
                     small
                     @click="buttonClicked" />
        </div>
        <div class="addon-card-label" :title="addon.label">
          {{ addon.label }}
        </div>
        <div v-if="addon.verifiedAuthor" class="addon-card-subtitle">
          {{ addon.author }}
          <f7-icon v-if="addon.verifiedAuthor"
                   size="15"
                   :color="$f7.data.themeOptions.dark === 'dark' ? 'white' : 'blue'"
                   f7="checkmark_seal_fill"
                   style="margin-top: -3px;" />
        </div>
        <div v-else-if="addon.properties && addon.properties.views" class="addon-card-subtitle">
          <addon-stats-line :addon="addon" :iconSize="15" />
        </div>
      </div>
      <addon-logo class="logo-square"
                  :lazy="lazyLogo !== undefined ? lazyLogo : true"
                  :addon="addon"
                  :size="150" />
    </div>
  </f7-link>
</template>

<style lang="stylus">
.addon-card
  width 100%
  position relative

  .addon-card-inner
    width 100%
    height 100%
    margin 0
    display flex
    flex-direction column
    scroll-snap-align center center
    padding 10px
    border-radius 5px
    box-sizing border-box

    &:hover
      background var(--f7-list-link-hover-bg-color)

  .install-button
    --f7-button-text-transform uppercase
    --f7-button-bg-color var(--f7-list-item-border-color)
  .addon-card-headline
    text-transform uppercase
    color var(--f7-theme-color)
    font-size 11px
    font-weight 500
  .addon-card-title
    height 3.4rem
    font-size var(--f7-timeline-item-title-font-size) // 21px
    font-weight var(--f7-list-media-item-title-font-weight)
    line-height 1.75
    .addon-card-label
      text-overflow ellipsis
      overflow clip
      color var(--f7-text-color)
      max-height 3.4rem
      line-height 1.1
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
  .addon-card-subtitle
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
    display flex
    justify-content center
    align-items center
    &:after
      content ' '
      display block
      padding-bottom 100%
    .logo
      position absolute
      top 3px
      left 3px
      width calc(100% - 6px)
      height calc(100% - 6px)
      object-fit contain
</style>

<script>
import AddonStatsLine from './addon-stats-line.vue'
import AddonLogo from '@/components/addons/addon-logo.vue'

export default {
  props: {
    addon: Object,
    headline: String,
    installActionText: String,
    lazyLogo: Boolean
  },
  emits: ['addon-button-click'],
  components: {
    AddonLogo,
    AddonStatsLine
  },
  computed: {
    autoHeadline () {
      if (this.addon.properties && this.addon.properties.like_count && this.addon.properties.like_count >= 20) return 'Top'
      if (this.addon.properties && this.addon.properties.views && this.addon.properties.views >= 1000) return 'Popular'
      if (this.addon.properties && this.addon.properties.posts_count && this.addon.properties.posts_count >= 15) return 'Hot'
      return ''
    },
    showInstallActions () {
      let splitted = this.addon.uid.split(':')
      return splitted.length < 2 || splitted[0] !== 'eclipse'
    }
  },
  methods: {
    buttonClicked () {
      this.$emit('addon-button-click', this.addon)
    }
  }
}
</script>
