<template>
  <f7-list-item
    v-if="addon"
    class="addon-list-item padding-right-half"
    :title="addon.label"
    :link="`/addons/${addon.type}/${addon.uid}`">
    <template #subtitle>
      <div v-if="addon.verifiedAuthor">
        {{ addon.author }}
        <f7-icon v-if="addon.verifiedAuthor"
                 size="15"
                 :color="uiOptionsStore.getDarkMode() === 'dark' ? 'white' : 'blue'"
                 f7="checkmark_seal_fill"
                 style="margin-top: -3px" />
      </div>
      <div v-else-if="addon.properties && addon.properties.views">
        <addon-stats-line :addon="addon" :iconSize="15" />
      </div>
    </template>
    <template #media>
      <addon-logo class="logo-square"
                  :lazy="true"
                  :addon="addon"
                  size="64" />
    </template>
    <template #after>
      <div v-if="showInstallActions">
        <f7-preloader v-if="addon.pending" color="blue" />
        <f7-button
          v-else-if="addon.installed"
          class="install-button prevent-active-state-propagation"
          text="Remove"
          color="red"
          round
          small
          @click="buttonClicked" />
        <f7-button
          v-else
          class="install-button prevent-active-state-propagation"
          :text="installActionText || 'Install'"
          color="blue"
          round
          small
          @click="buttonClicked" />
      </div>
    </template>
  </f7-list-item>
</template>

<style lang="stylus">
.addon-list-item
  --f7-list-item-subtitle-text-color var(--f7-list-item-after-text-color)
  .item-inner
    padding-right 3px !important
  .logo-square
    background white
    border-radius 10%
    width 64px
    height 64px
    margin-left 3px
    display flex
    justify-content center
    align-items center
    .logo
      margin-left 0
      max-height 54px
      max-width 54px
  .item-media i
    padding-left 3px
  .item-after
    min-width 70px
    justify-content center
    height var(--f7-button-small-height)
    --f7-preloader-size var(--f7-button-small-height)
    align-self auto !important
  .install-button
    // --f7-button-bg-color var(--f7-color-gray)
    --f7-button-text-transform uppercase
    --f7-button-bg-color var(--f7-list-item-border-color)
</style>

<script>
import AddonStatsLine from './addon-stats-line.vue'
import AddonLogo from '@/components/addons/addon-logo.vue'
import { f7 } from 'framework7-vue'
import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'
import { mapStores } from 'pinia'

export default {
  props: {
    addon: Object,
    installActionText: String
  },
  emits: ['addon-button-click'],
  components: {
    AddonLogo,
    AddonStatsLine
  },
  computed: {
    showInstallActions () {
      let splitted = this.addon.uid.split(':')
      return splitted.length < 2 || splitted[0] !== 'eclipse'
    },
    ...mapStores(useUIOptionsStore)
  },
  methods: {
    buttonClicked () {
      this.$emit('addon-button-click', this.addon)
    }
  }
}
</script>
