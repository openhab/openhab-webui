<template>
  <f7-block class="theme-switcher">
    <f7-block-title class="padding-left">
      {{ t('about.theme') }}
    </f7-block-title>
    <f7-row>
      <f7-col width="25" class="theme-picker auto" @click="switchTheme('auto')">
        <span class="text-color-gray"> {{ t('about.theme.auto') }}</span>
        <f7-checkbox checked disabled v-if="theme === 'auto'" />
      </f7-col>
      <f7-col width="25" class="theme-picker" @click="switchTheme('md')">
        <span><f7-icon f7="logo_android" size="20" color="gray" /></span>
        <f7-checkbox checked disabled v-if="theme === 'md'" />
      </f7-col>
      <f7-col width="25" class="theme-picker" @click="switchTheme('ios')">
        <span><f7-icon f7="logo_ios" size="25" color="gray" /></span>
        <f7-checkbox checked disabled v-if="theme === 'ios'" />
      </f7-col>
      <f7-col width="25" class="theme-picker" @click="switchTheme('aurora')">
        <span><f7-icon f7="desktopcomputer" size="20" color="gray" /></span>
        <f7-checkbox checked disabled v-if="theme === 'aurora'" />
      </f7-col>
    </f7-row>
    <f7-block-title>{{ t('about.darkMode') }}</f7-block-title>
    <f7-row>
      <f7-col width="33" class="theme-picker auto" @click="uiOptionsStore.setDarkMode('auto')">
        <span class="text-color-gray">{{ t('about.darkMode.auto') }}</span>
        <f7-checkbox checked disabled v-if="uiOptionsStore.storedDarkMode === 'auto'" />
      </f7-col>
      <f7-col
        width="33"
        class="bg-color-white theme-picker"
        @click="uiOptionsStore.setDarkMode('light')">
        <span class="text-color-gray">{{ t('about.darkMode.light') }}</span>
        <f7-checkbox checked disabled v-if="uiOptionsStore.storedDarkMode === 'light'" />
      </f7-col>
      <f7-col
        width="33"
        class="bg-color-black theme-picker"
        @click="uiOptionsStore.setDarkMode('dark')">
        <span class="text-color-gray">{{ t('about.darkMode.dark') }}</span>
        <f7-checkbox checked disabled v-if="uiOptionsStore.storedDarkMode === 'dark'" />
      </f7-col>
    </f7-row>
    <f7-block-title>{{ t('about.navigationBarsStyle') }}</f7-block-title>
    <f7-row>
      <f7-col width="50" class="nav-bars-picker nav-bars-picker-empty" @click="bars='light'">
        <div class="demo-navbar" />
        <f7-checkbox checked disabled v-if="bars === 'light'" />
      </f7-col>
      <f7-col width="50" class="nav-bars-picker nav-bars-picker-fill" @click="bars='filled'">
        <div class="demo-navbar" />
        <f7-checkbox checked disabled v-if="bars === 'filled'" />
      </f7-col>
    </f7-row>

    <f7-row>
      <f7-col>
        <f7-block-title>{{ t('about.miscellaneous') }}</f7-block-title>
        <f7-list>
          <f7-list-item>
            <span>{{ t('about.miscellaneous.home.navbar') }}</span>
            <f7-segmented class="home-navbar-selection">
              <f7-button v-for="navbarstyle in ['default', 'simple', 'large']"
                         outline
                         small
                         :active="homeNavBar === navbarstyle"
                         @click="homeNavBar = navbarstyle"
                         :text="t('about.miscellaneous.home.navbar.' + navbarstyle)"
                         :key="navbarstyle" />
            </f7-segmented>
          </f7-list-item>
          <f7-list-item>
            <span>{{ t('about.miscellaneous.home.background') }}</span>
            <f7-segmented class="home-navbar-selection">
              <f7-button v-for="background in ['default', 'standard', 'white']"
                         outline
                         small
                         :active="homeBackground === background"
                         @click="homeBackground = background"
                         :text="t('about.miscellaneous.home.background.' + background)"
                         :key="background" />
            </f7-segmented>
          </f7-list-item>
          <f7-list-item v-show="runtimeStore.apiEndpoint('habot')">
            <span>{{ t('about.miscellaneous.home.hideChatInput') }}</span>
            <f7-toggle v-model:checked="hideChatInput" />
          </f7-list-item>
          <f7-list-item>
            <span>{{ t('about.miscellaneous.home.disableCardExpansionAnimation') }}</span>
            <f7-toggle v-model:checked="disableExpandableCardAnimation" />
          </f7-list-item>
          <f7-list-item>
            <span>{{ t('about.miscellaneous.theme.disablePageTransition') }}</span>
            <f7-toggle v-model:checked="disablePageTransitionAnimation" />
          </f7-list-item>
          <f7-list-item>
            <span>{{ t('about.miscellaneous.webaudio.enable') }}</span>
            <f7-toggle v-model:checked="webAudio" />
          </f7-list-item>
          <f7-list-group>
            <item-picker
              :title="t('about.miscellaneous.commandItem.title')"
              :multiple="false"
              :value="commandItem"
              @input="setCommandItem" />
          </f7-list-group>
        </f7-list>
      </f7-col>
    </f7-row>
  </f7-block>
</template>

<style lang="stylus">
.theme-switcher
  .home-navbar-selection
    .button
      width auto
</style>
<script>
import { mapStores, mapWritableState } from 'pinia'

import ItemPicker from '@/components/config/controls/item-picker.vue'

import { loadLocaleMessages } from '@/js/i18n'
import { useI18n } from 'vue-i18n'

import { useRuntimeStore } from '@/js/stores/useRuntimeStore'
import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'


export default {
  components: {
    ItemPicker
  },
  setup () {
    const { t, mergeLocaleMessage } = useI18n({ useScope: 'local' })
    loadLocaleMessages('theme-switcher', mergeLocaleMessage)
    return {
      t
    }
  },
  methods: {
    switchTheme (theme) {
      localStorage.setItem('openhab.ui:theme', theme)
      localStorage.removeItem('openhab.ui:theme.bars') // reset the bars to their default when switching themes
      location.reload()
    },
    setCommandItem (value) {
      localStorage.setItem('openhab.ui:commandItem', value)
      setTimeout(() => { location.reload() }, 50) // Delay reload, otherwise it doesn't work
    }
  },
  computed: {
    theme () {
      return localStorage.getItem('openhab.ui:theme') || 'auto'
    },
    commandItem () {
      return localStorage.getItem('openhab.ui:commandItem') || ''
    },
    ...mapStores(useRuntimeStore, useUIOptionsStore),
    ...mapWritableState(useUIOptionsStore, [ 'disablePageTransitionAnimation',  'bars', 'homeNavBar', 'homeBackground', 'hideChatInput', 'disableExpandableCardAnimation', 'webAudio' ])
  }
}
</script>

<style lang="stylus">
.theme-picker
  cursor pointer
  height 100px
  padding 40px 20px
  border-radius 10px
  box-shadow 0px 5px 20px rgba(0,0,0,0.1)
  border 1px solid rgba(255,255,255,0.2)
  box-sizing border-box
  position relative
  display flex
  align-content center
  font-size 16px
  span
    width 100%
    text-align center
  i.f7-icons
    width 100%
    text-align center
  .checkbox
    position absolute
    left 10px
    bottom 10px

.nav-bars-picker
  height 200px
  border-radius 10px
  box-shadow 0px 5px 20px rgba(0,0,0,0.1)
  cursor pointer
  position relative
  overflow hidden
  background var(--f7-page-bg-color)
  border 1px solid rgba(255,255,255,0.2)

.nav-bars-picker .checkbox
  position absolute
  left 10px
  bottom 10px

.nav-bars-picker .demo-navbar
  position absolute
  left 0
  width 100%
  height 30px
  top 0
  border-bottom 1px solid transparent

.nav-bars-picker .demo-navbar:before
  content ''
  position absolute
  left 10px
  width 20px
  height 10px
  top 50%
  margin-top -5px

.nav-bars-picker .demo-navbar:after
  content ''
  position absolute
  right 10px
  width 20px
  height 10px
  top 50%
  margin-top -5px

.nav-bars-picker-empty .demo-navbar
  background #f7f7f8
  border-color rgba(0,0,0,0.1)

.dark .nav-bars-picker-empty .demo-navbar
  background #1b1b1b
  border-color #282829

.nav-bars-picker-empty .demo-navbar:before,
.nav-bars-picker-empty .demo-navbar:after
  background var(--f7-theme-color)

.nav-bars-picker-fill .demo-navbar
  background var(--f7-theme-color)

.nav-bars-picker-fill .demo-navbar:before,
.nav-bars-picker-fill .demo-navbar:after
  background #fff
</style>
