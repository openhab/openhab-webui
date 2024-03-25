<template>
  <f7-list-item
    v-if="addon"
    class="addon-list-item padding-right-half"
    :title="addon.label"
    :link="addon.id">
    <div v-if="addon.verifiedAuthor" slot="subtitle">
      {{ addon.author }}
      <f7-icon v-if="addon.verifiedAuthor" size="15" :color="$f7.data.themeOptions.dark === 'dark' ? 'white' : 'blue'" f7="checkmark_seal_fill" style="margin-top: -3px" />
    </div>
    <div v-else-if="addon.properties && addon.properties.views" slot="subtitle">
      <addon-stats-line :addon="addon" :iconSize="15" />
    </div>
    <f7-icon v-show="!logoLoaded" slot="media" size="64" color="gray" :f7="addonIcon" class="item-default-icon" />
    <div class="item-logo" slot="media">
      <img v-if="!logoError" class="lazy" :style="{ visibility: logoLoaded ? 'visible': 'hidden' }" ref="logo" width="54" :data-src="imageUrl">
    </div>
    <div slot="after">
      <f7-preloader v-if="addon.pending" color="blue" />
      <f7-button v-else-if="addon.installed" class="install-button prevent-active-state-propagation" text="Remove" color="red" round small @click="buttonClicked" />
      <f7-button v-else class="install-button prevent-active-state-propagation" :text="installActionText || 'Install'" color="blue" round small @click="buttonClicked" />
    </div>
  </f7-list-item>
</template>

<style lang="stylus">
.addon-list-item
  --f7-list-item-subtitle-text-color var(--f7-list-item-after-text-color)
  .item-inner
    padding-right 3px !important
  .item-logo
    display flex
    justify-content center
    align-items center
    margin-left 3px
    width 64px
    height 64px
    background white
    border-radius 5px
    img
      max-height 54px
  .item-default-icon
    opacity 0.2
    position absolute
  .item-media i
    padding-left 3px
  .item-after
    min-width 70px
    justify-content center
    height var(--f7-button-small-height)
    --f7-preloader-size var(--f7-button-small-height)
  .install-button
    // --f7-button-bg-color var(--f7-color-gray)
    --f7-button-text-transform uppercase
    --f7-button-bg-color var(--f7-list-item-border-color)
</style>

<script>
import { AddonIcons } from '@/assets/addon-store'
import AddonStatsLine from './addon-stats-line.vue'

export default {
  props: ['addon', 'installActionText'],
  components: {
    AddonStatsLine
  },
  data () {
    return {
      logoLoaded: false,
      logoError: false,
      addonIcon: null
    }
  },
  computed: {
    imageUrl () {
      if (this.addon.imageLink) return this.addon.imageLink.replace(/^\/\//, 'https://')
      let docsBranch = 'final-3.4.x'
      return `https://raw.githubusercontent.com/openhab/openhab-docs/${docsBranch}/images/addons/${this.addon.id.substring(this.addon.id.indexOf('-') + 1)}.png`
    }
  },
  mounted () {
    this.addonIcon = AddonIcons[this.addon.type]
    this.$$(this.$refs.logo).once('lazy:loaded', (e) => {
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
