<template>
  <f7-block>
    <f7-block-title class="padding-left">Theme</f7-block-title>
    <f7-row>
      <f7-col width="25" class="theme-picker auto" @click="switchTheme('auto')">
        <span class="text-color-gray">Auto</span>
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
    <f7-block-title>Dark mode</f7-block-title>
    <f7-row>
      <f7-col width="33" class="theme-picker auto" @click="setThemeDark('auto')">
        <span class="text-color-gray">Auto</span>
        <f7-checkbox checked disabled v-if="darkMode === 'auto'" />
      </f7-col>
      <f7-col width="33" class="bg-color-white theme-picker" @click="setThemeDark('light')">
        <span class="text-color-gray">Light</span>
        <f7-checkbox checked disabled v-if="darkMode === 'light'" />
      </f7-col>
      <f7-col width="33" class="bg-color-black theme-picker" @click="setThemeDark('dark')">
        <span class="text-color-gray">Dark</span>
        <f7-checkbox checked disabled v-if="darkMode === 'dark'" />
      </f7-col>
    </f7-row>
    <f7-block-title>Navigation bars style</f7-block-title>
    <f7-row>
      <f7-col width="50" class="nav-bars-picker nav-bars-picker-fill" @click="setBarsStyle('filled')">
        <div class="demo-navbar"></div>
        <f7-checkbox checked disabled v-if="barsStyle === 'filled'" />
      </f7-col>
      <f7-col width="50" class="nav-bars-picker nav-bars-picker-empty" @click="setBarsStyle('light')">
        <div class="demo-navbar"></div>
        <f7-checkbox checked disabled v-if="barsStyle === 'light'" />
      </f7-col>
    </f7-row>

    <f7-row>
      <f7-col>
        <f7-block-title>Miscellaneous</f7-block-title>
        <f7-list>
          <f7-list-item>
            <span>Simple navigation bar on home page</span>
            <f7-toggle :checked="homePageNavbarStyle === 'simple'" @toggle:change="setHomePageNavbarStyle"></f7-toggle>
          </f7-list-item>
          <f7-list-item>
            <span>Standard home page background color</span>
            <f7-toggle :checked="homePageBackground === 'standard'" @toggle:change="setHomePageBackground"></f7-toggle>
          </f7-list-item>
          <f7-list-item>
            <span>Disable card expansion animations</span>
            <f7-toggle :checked="expandableCardsAnimation === 'disabled'" @toggle:change="setExpandableCardAnimation"></f7-toggle>
          </f7-list-item>
          <f7-list-item>
            <span>Disable page transition animations</span>
            <f7-toggle :checked="pageTransitionAnimation === 'disabled'" @toggle:change="setPageTransitionAnimation"></f7-toggle>
          </f7-list-item>
        </f7-list>
      </f7-col>
    </f7-row>
  </f7-block>
</template>
<script>
export default {
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
      localStorage.setItem('openhab.ui:theme.home.navbar', (value) ? 'simple' : 'default')
      location.reload()
    },
    setHomePageBackground (value) {
      localStorage.setItem('openhab.ui:theme.home.background', (value) ? 'standard' : 'default')
      location.reload()
    },
    setExpandableCardAnimation (value) {
      localStorage.setItem('openhab.ui:theme.home.cardanimation', (value) ? 'disabled' : 'default')
      location.reload()
    },
    setPageTransitionAnimation (value) {
      localStorage.setItem('openhab.ui:theme.pagetransition', (value) ? 'disabled' : 'default')
      location.reload()
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
      return localStorage.getItem('openhab.ui:theme.bars') || ((this.$theme.ios || this.$f7.darkTheme || this.darkMode === 'dark') ? 'light' : 'filled')
    },
    homePageNavbarStyle () {
      return localStorage.getItem('openhab.ui:theme.home.navbar') || 'default'
    },
    homePageBackground () {
      return localStorage.getItem('openhab.ui:theme.home.background') || 'default'
    },
    expandableCardsAnimation () {
      return localStorage.getItem('openhab.ui:theme.home.cardanimation') || 'default'
    },
    pageTransitionAnimation () {
      return localStorage.getItem('openhab.ui:theme.pagetransition') || 'default'
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
