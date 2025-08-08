<template>
  <f7-block class="theme-switcher">
    <f7-block-title class="padding-left" v-t="'about.theme'" />
    <f7-row>
      <f7-col width="25" class="theme-picker auto" @click="switchTheme('auto')">
        <span class="text-color-gray" v-t="'about.theme.auto'">Auto</span>
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
    <f7-block-title v-t="'about.darkMode'" />
    <f7-row>
      <f7-col width="33" class="theme-picker auto" @click="setThemeDark('auto')">
        <span class="text-color-gray" v-t="'about.darkMode.auto'" />
        <f7-checkbox checked disabled v-if="darkMode === 'auto'" />
      </f7-col>
      <f7-col width="33" class="bg-color-white theme-picker" @click="setThemeDark('light')">
        <span class="text-color-gray" v-t="'about.darkMode.light'" />
        <f7-checkbox checked disabled v-if="darkMode === 'light'" />
      </f7-col>
      <f7-col width="33" class="bg-color-black theme-picker" @click="setThemeDark('dark')">
        <span class="text-color-gray" v-t="'about.darkMode.dark'" />
        <f7-checkbox checked disabled v-if="darkMode === 'dark'" />
      </f7-col>
    </f7-row>
    <f7-block-title v-t="'about.navigationBarsStyle'" />
    <f7-row>
      <f7-col width="50" class="nav-bars-picker nav-bars-picker-empty" @click="setBarsStyle('light')">
        <div class="demo-navbar" />
        <f7-checkbox checked disabled v-if="barsStyle === 'light'" />
      </f7-col>
      <f7-col width="50" class="nav-bars-picker nav-bars-picker-fill" @click="setBarsStyle('filled')">
        <div class="demo-navbar" />
        <f7-checkbox checked disabled v-if="barsStyle === 'filled'" />
      </f7-col>
    </f7-row>

    <f7-row>
      <f7-col>
        <f7-block-title v-t="'about.miscellaneous'" />
        <f7-list>
          <f7-list-item>
            <span v-t="'about.miscellaneous.home.navbar'" />
            <f7-segmented class="home-navbar-selection">
              <f7-button outline
                         small
                         :active="homePageNavbarStyle === 'default'"
                         @click="setHomePageNavbarStyle('default')">
                {{ $t('about.miscellaneous.home.navbar.default') }}
              </f7-button>
              <f7-button outline
                         small
                         :active="homePageNavbarStyle === 'simple'"
                         @click="setHomePageNavbarStyle('simple')">
                {{ $t('about.miscellaneous.home.navbar.simple') }}
              </f7-button>
              <f7-button outline
                         small
                         :active="homePageNavbarStyle === 'large'"
                         @click="setHomePageNavbarStyle('large')">
                {{ $t('about.miscellaneous.home.navbar.large') }}
              </f7-button>
            </f7-segmented>
          </f7-list-item>
          <f7-list-item>
            <span v-t="'about.miscellaneous.home.background'" />
            <f7-segmented class="home-navbar-selection">
              <f7-button outline
                         small
                         :active="homePageBackground === 'default'"
                         @click="setHomePageBackground('default')">
                {{ $t('about.miscellaneous.home.background.default') }}
              </f7-button>
              <f7-button outline
                         small
                         :active="homePageBackground === 'standard'"
                         @click="setHomePageBackground('standard')">
                {{ $t('about.miscellaneous.home.background.standard') }}
              </f7-button>
              <f7-button outline
                         small
                         :active="homePageBackground === 'white'"
                         @click="setHomePageBackground('white')">
                {{ $t('about.miscellaneous.home.background.white') }}
              </f7-button>
            </f7-segmented>
          </f7-list-item>
          <f7-list-item v-show="$store.getters.apiEndpoint('habot')">
            <span v-t="'about.miscellaneous.home.hideChatInput'" />
            <f7-toggle :checked="hideChatInput === 'true'" @toggle:change="setHideChatInput" />
          </f7-list-item>
          <f7-list-item>
            <span v-t="'about.miscellaneous.home.disableCardExpansionAnimation'" />
            <f7-toggle :checked="expandableCardsAnimation === 'disabled'" @toggle:change="setExpandableCardAnimation" />
          </f7-list-item>
          <f7-list-item>
            <span v-t="'about.miscellaneous.theme.disablePageTransition'" />
            <f7-toggle :checked="pageTransitionAnimation === 'disabled'" @toggle:change="setPageTransitionAnimation" />
          </f7-list-item>
          <f7-list-item>
            <span v-t="'about.miscellaneous.webaudio.enable'" />
            <f7-toggle :checked="webAudio === 'enabled'" @toggle:change="setWebAudio" />
          </f7-list-item>
          <item-picker :title="$t('about.miscellaneous.commandItem.title')"
                       :multiple="false"
                       :value="commandItem"
                       @input="setCommandItem" />
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
import { loadLocaleMessages } from '@/js/i18n'
import ItemPicker from '@/components/config/controls/item-picker.vue'

export default {
  components: {
    ItemPicker
  },
  i18n: {
    messages: loadLocaleMessages(require.context('@/assets/i18n/theme-switcher'))
  },
  methods: {
    switchTheme (theme) {
      localStorage.setItem('openhab.ui:theme', theme)
      localStorage.removeItem('openhab.ui:theme.bars') // reset the bars to their default when switching themes
      location.reload()
    },
    setThemeDark (value) {
      if (value === 'auto') {
        localStorage.removeItem('openhab.ui:theme.dark')
      } else {
        localStorage.setItem('openhab.ui:theme.dark', value)
      }
      localStorage.removeItem('openhab.ui:theme.bars') // reset the bars to their default when switching dark mode
      location.reload()
    },
    setBarsStyle (value) {
      localStorage.setItem('openhab.ui:theme.bars', value)
      location.reload()
    },
    setHomePageNavbarStyle (value) {
      localStorage.setItem('openhab.ui:theme.home.navbar', value)
      location.reload()
    },
    setHomePageBackground (value) {
      localStorage.setItem('openhab.ui:theme.home.background', value)
      location.reload()
    },
    setHideChatInput (value) {
      localStorage.setItem('openhab.ui:theme.home.hidechatinput', (value) ? 'true' : 'false')
      location.reload()
    },
    setExpandableCardAnimation (value) {
      localStorage.setItem('openhab.ui:theme.home.cardanimation', (value) ? 'disabled' : 'default')
      location.reload()
    },
    setPageTransitionAnimation (value) {
      localStorage.setItem('openhab.ui:theme.pagetransition', (value) ? 'disabled' : 'default')
      location.reload()
    },
    setWebAudio (value) {
      localStorage.setItem('openhab.ui:webaudio.enable', (value) ? 'enabled' : 'default')
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
    darkMode () {
      return localStorage.getItem('openhab.ui:theme.dark') || 'auto'
    },
    barsStyle () {
      return localStorage.getItem('openhab.ui:theme.bars') || 'light'
    },
    homePageNavbarStyle () {
      return localStorage.getItem('openhab.ui:theme.home.navbar') || 'default'
    },
    homePageBackground () {
      return localStorage.getItem('openhab.ui:theme.home.background') || 'default'
    },
    hideChatInput () {
      return localStorage.getItem('openhab.ui:theme.home.hidechatinput') || 'default'
    },
    expandableCardsAnimation () {
      return localStorage.getItem('openhab.ui:theme.home.cardanimation') || 'default'
    },
    pageTransitionAnimation () {
      return localStorage.getItem('openhab.ui:theme.pagetransition') || 'default'
    },
    webAudio () {
      return localStorage.getItem('openhab.ui:webaudio.enable') || 'default'
    },
    commandItem () {
      return localStorage.getItem('openhab.ui:commandItem') || ''
    }
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

.theme-dark .nav-bars-picker-empty .demo-navbar
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
