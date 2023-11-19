<template>
  <f7-page stacked name="HomePage" class="page-home" :class="{ 'standard-background': $f7.data.themeOptions.homeBackground === 'standard' }" @page:init="onPageInit" @page:beforein="onPageBeforeIn" @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar :large="$f7.data.themeOptions.homeNavbar !== 'simple'" :large-transparent="$f7.data.themeOptions.homeNavbar !== 'simple'" class="home-nav disable-user-select">
      <f7-nav-left>
        <f7-link icon-ios="f7:menu" icon-aurora="f7:menu" icon-md="material:menu" panel-open="left" />
      </f7-nav-left>
      <f7-nav-title-large v-if="$f7.data.themeOptions.homeNavbar !== 'simple'" class="home-title-large">
        <span class="today">{{ new Date().toLocaleString($store.getters.locale, { weekday: 'long', day: 'numeric', month: 'long' }) }}</span>
        {{ title }}
      </f7-nav-title-large>
      <f7-nav-title>
        {{ title }}
      </f7-nav-title>
      <f7-nav-right>
        <f7-link v-if="(this.$store.getters.isAdmin && $store.state.developerDock && $f7.width >= 1280)" icon-f7="question_circle_fill" @click="$f7.emit('toggleDeveloperDock')" />
        <f7-link v-else-if="(this.$store.getters.isAdmin && !$store.state.developerDock && $f7.width >= 1280)" icon-f7="question_circle" @click="$f7.emit('selectDeveloperDock',{'dock':'help','helpTab':'current'})" />
        <f7-link v-if="this.$store.getters.isAdmin" icon-ios="f7:pencil" icon-aurora="f7:pencil" icon-md="material:edit" :tooltip="$t('home.editHome')" :href="(homePageComponent) ? '/settings/pages/home/home' : '/settings/pages/home/add'" />
        <f7-link v-if="showPinToHome" icon-ios="f7:pin_fill" icon-aurora="f7:pin_fill" icon-md="material:add_location" :tooltip="$t('home.pinToHome')" @click="pinToHome" />
        <f7-link v-if="showExitToApp" icon-ios="f7:square_arrow_right" icon-aurora="f7:square_arrow_right" icon-md="material:exit_to_app" :tooltip="$t('home.exitToApp')" @click="exitToApp" />
        <f7-link v-else icon-ios="f7:sidebar_right" icon-aurora="f7:sidebar_right" icon-md="material:exit_to_app" :tooltip="$t('home.otherApps')" panel-open="right" @click="($store.state.developerDock) ? $f7.emit('toggleDeveloperDock') : ''" />
      </f7-nav-right>
    </f7-navbar>
    <f7-toolbar tabbar labels bottom v-if="tabsVisible">
      <f7-link tab-link @click="switchTab('overview')" :tab-link-active="currentTab === 'overview'" icon-ios="f7:house_fill" icon-aurora="f7:house_fill" icon-md="material:home" :text="$t('home.overview.tab')" />
      <f7-link tab-link v-if="tabVisible('locations')" @click="switchTab('locations')" :tab-link-active="currentTab === 'locations'" icon-ios="f7:placemark_fill" icon-aurora="f7:placemark_fill" icon-md="material:place" :text="$t('home.locations.tab')" />
      <f7-link tab-link v-if="tabVisible('equipment')" @click="switchTab('equipment')" :tab-link-active="currentTab === 'equipment'" icon-ios="f7:cube_box_fill" icon-aurora="f7:cube_box_fill" icon-md="material:payments" :text="$t('home.equipment.tab')" />
      <f7-link tab-link v-if="tabVisible('properties')" @click="switchTab('properties')" :tab-link-active="currentTab === 'properties'" icon-ios="f7:bolt_fill" icon-aurora="f7:bolt_fill" icon-md="material:flash_on" :text="$t('home.properties.tab')" />
    </f7-toolbar>

    <f7-block v-if="!ready || (currentTab !== 'overview' && !modelReady)" class="text-align-center padding-top margin-top">
      <f7-block-title>
        <f7-preloader :size="30" />
        <div>Loading...</div>
      </f7-block-title>
      <f7-block v-if="loopError">
        <f7-block-title>
          <div>Error!</div>
        </f7-block-title>
        {{ loopError }}. Please correct and refresh.
      </f7-block>
    </f7-block>
    <f7-tabs v-else>
      <f7-tab id="tab-overview" :tab-active="currentTab === 'overview'" @tab:show="() => this.currentTab = 'overview'">
        <overview-tab v-if="currentTab === 'overview'" :context="context" :key="overviewPageKey" :allow-chat="allowChat" />
      </f7-tab>
      <f7-tab id="tab-locations" :tab-active="currentTab === 'locations'" @tab:show="() => this.currentTab = 'locations'">
        <model-tab v-if="currentTab === 'locations'" :context="context" type="locations" :model="model" :page="homePageComponent" />
      </f7-tab>
      <f7-tab id="tab-equipment" :tab-active="currentTab === 'equipment'" @tab:show="() => this.currentTab = 'equipment'">
        <model-tab v-if="currentTab === 'equipment'" :context="context" type="equipment" :model="model" :page="homePageComponent" />
      </f7-tab>
      <f7-tab id="tab-properties" :tab-active="currentTab === 'properties'" @tab:show="() => this.currentTab = 'properties'">
        <model-tab v-if="currentTab === 'properties'" :context="context" type="properties" :model="model" :page="homePageComponent" />
      </f7-tab>
    </f7-tabs>
  </f7-page>
</template>

<style lang="stylus">
.theme-filled .home-nav .home-title-large .title-large-text
  color var(--f7-text-color)
.theme-filled .home-nav.navbar-large:not(.navbar-large-collapsed) .link.icon-only
  color var(--f7-theme-color)
  transition color 0.3s
.theme-filled .home-nav.navbar-large.navbar-large-collapsed .link.icon-only
  color var(--f7-navbar-link-color)
  transition color 0.3s
.home-nav .home-title-large .title-large-text
  line-height 0.98
  .today
    position absolute
    font-size 8pt
    font-weight normal
    text-transform uppercase
    top -6px
    letter-spacing 1px
    color var(--f7-list-item-footer-text-color)
.edit-home-button
  float right
  display absolute
  z-index 9000
</style>

<script>
import OverviewTab from './home/overview-tab.vue'
import ModelTab from './home/model-tab.vue'

import HomeCards from './home/homecards-mixin'

export default {
  props: ['initialTab'],
  mixins: [HomeCards],
  components: {
    OverviewTab,
    ModelTab
  },
  data () {
    return {
      showSetup: true,
      showTasks: true,
      showCards: false,
      showPinToHome: false,
      showExitToApp: false,
      currentTab: this.initialTab || 'overview',
      overviewPageKey: this.$utils.id(),
      items: []
    }
  },
  computed: {
    ready () {
      return this.$store.state.apiVersion > 0
    },
    context () {
      return {
        store: this.$store.getters.trackedItems
      }
    },
    homePageComponent () {
      const page = this.$store.getters.page('home')
      if (!page) return null
      if (page.component !== 'oh-home-page') return null
      return page
    },
    tabsVisible () {
      if (!this.homePageComponent) return true
      const visibleTo = this.homePageComponent.config.displayModelCardsTo
      if (visibleTo === undefined || !visibleTo.length) return true
      const user = this.$store.getters.user
      if (!user) return false
      if (user.roles && user.roles.some(r => visibleTo.indexOf('role:' + r) >= 0)) return true
      if (visibleTo.indexOf('user:' + user.name) >= 0) return true
      return false
    },
    allowChat () {
      if (!this.homePageComponent) return true
      const visibleTo = this.homePageComponent.config.allowChatInputTo
      if (visibleTo === undefined || !visibleTo.length) return true
      const user = this.$store.getters.user
      if (!user) return false
      if (user.roles && user.roles.some(r => visibleTo.indexOf('role:' + r) >= 0)) return true
      if (visibleTo.indexOf('user:' + user.name) >= 0) return true
      return false
    },
    title () {
      switch (this.currentTab) {
        case 'overview':
          return this.$t('home.overview.title')
        case 'locations':
          return this.$t('home.locations.title')
        case 'equipment':
          return this.$t('home.equipment.title')
        case 'properties':
          return this.$t('home.properties.title')
        default:
          return this.$t('home.overview.title')
      }
    }
  },
  watch: {
    ready (val, oldVal) {
      if (val && !oldVal) {
        this.$store.dispatch('startTrackingStates')
      }
    }
  },
  methods: {
    onPageBeforeIn () {
      this.$f7router.updateCurrentUrl('/' + this.currentTab)
      this.overviewPageKey = this.$utils.id()
    },
    onPageAfterIn () {
      if (this.ready) {
        this.loadModel()
        this.$store.dispatch('startTrackingStates')
      }
    },
    onPageBeforeOut () {
      this.$store.dispatch('stopTrackingStates')
    },
    onPageInit () {
      this.$store.subscribe((mutation, state) => {
        if (mutation.type === 'setSemantics') {
          this.loadModel()
        }
      })

      if (window.OHApp) {
        if (window.OHApp.pinToHome) this.showPinToHome = true
        if (window.OHApp.exitToApp) this.showExitToApp = true
      }
    },
    pinToHome () {
      window.OHApp.pinToHome()
    },
    exitToApp () {
      window.OHApp.exitToApp()
    },
    switchTab (tab) {
      this.currentTab = tab
      this.$f7router.updateCurrentUrl('/' + this.currentTab)
    },
    tabVisible (tab) {
      if (!this.tabsVisible) return false
      if (!this.homePageComponent) return true
      const hiddenTabs = this.homePageComponent.config.hiddenModelTabs
      if (hiddenTabs === undefined || !hiddenTabs.length) return true
      return hiddenTabs.indexOf(tab) < 0
    }
  }
}
</script>
