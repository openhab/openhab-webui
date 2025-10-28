<template>
  <f7-page stacked
           name="HomePage"
           class="page-home"
           :class="{ 'standard-background': standardBackground }"
           @page:init="onPageInit"
           @page:beforein="onPageBeforeIn"
           @page:afterin="onPageAfterIn"
           @page:beforeout="onPageBeforeOut">
    <f7-navbar :large="!simpleNavbar"
               :large-transparent="!simpleNavbar"
               class="home-nav disable-user-select"
               ref="navbar">
      <f7-nav-left>
        <f7-link icon-ios="f7:menu"
                 icon-aurora="f7:menu"
                 icon-md="material:menu"
                 panel-open="left" />
      </f7-nav-left>
      <f7-nav-title-large v-if="!simpleNavbar" class="home-title-large">
        <span class="today">{{ new Date().toLocaleString(runtimeStore.locale, { weekday: 'long', day: 'numeric', month: 'long' }) }}</span>
        {{ title }}
      </f7-nav-title-large>
      <f7-nav-title>
        {{ title }}
      </f7-nav-title>
      <f7-nav-right>
        <developer-dock-icon />
        <f7-link v-if="userStore.isAdmin"
                 icon-ios="f7:pencil"
                 icon-aurora="f7:pencil"
                 icon-md="material:edit"
                 :tooltip="$t('home.editHome')"
                 :href="(homePageComponent) ? '/settings/pages/home/home' : '/settings/pages/home/add'" />
        <f7-link v-if="showPinToHome"
                 icon-ios="f7:pin_fill"
                 icon-aurora="f7:pin_fill"
                 icon-md="material:add_location"
                 :tooltip="$t('home.pinToHome')"
                 @click="pinToHome" />
        <f7-link v-if="showExitToApp"
                 icon-ios="f7:square_arrow_right"
                 icon-aurora="f7:square_arrow_right"
                 icon-md="material:exit_to_app"
                 :tooltip="$t('home.exitToApp')"
                 @click="exitToApp" />
        <f7-link v-else
                 icon-ios="f7:sidebar_right"
                 icon-aurora="f7:sidebar_right"
                 icon-md="material:exit_to_app"
                 :tooltip="$t('home.otherApps')"
                 panel-open="right"
                 @click="runtimeStore.showDeveloperDock ? f7.emit('toggleDeveloperDock') : ''" />
      </f7-nav-right>
    </f7-navbar>

    <f7-toolbar tabbar
                labels
                bottom
                v-if="tabsVisible">
      <f7-link tab-link="#tab-overview"
               @click="switchTab('overview')"
               :tab-link-active="currentTab === 'overview' ? true : null"
               icon-ios="f7:house_fill"
               icon-aurora="f7:house_fill"
               icon-md="material:home"
               :text="$t('home.overview.tab')" />
      <f7-link v-if="tabVisible('locations')"
               tab-link="#tab-locations"
               @click="switchTab('locations')"
               :tab-link-active="currentTab === 'locations' ? true : null"
               icon-ios="f7:placemark_fill"
               icon-aurora="f7:placemark_fill"
               icon-md="material:place"
               :text="$t('home.locations.tab')" />
      <f7-link v-if="tabVisible('equipment')"
               tab-link="#tab-equipment"
               @click="switchTab('equipment')"
               :tab-link-active="currentTab === 'equipment' ? true : null"
               icon-ios="f7:cube_box_fill"
               icon-aurora="f7:cube_box_fill"
               icon-md="material:payments"
               :text="$t('home.equipment.tab')" />
      <f7-link v-if="tabVisible('properties')"
               tab-link="#tab-properties"
               @click="switchTab('properties')"
               :tab-link-active="currentTab === 'properties' ? true : null"
               icon-ios="f7:bolt_fill"
               icon-aurora="f7:bolt_fill"
               icon-md="material:flash_on"
               :text="$t('home.properties.tab')" />
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
      <f7-tab id="tab-overview" :tab-active="currentTab === 'overview' ? true : null" @tab:show="currentTab = 'overview'">
        <overview-tab v-if="currentTab === 'overview'"
                      :context="context"
                      :key="overviewPageKey"
                      :allow-chat="allowChat"
                      :f7router />
      </f7-tab>
      <f7-tab id="tab-locations" :tab-active="currentTab === 'locations' ? true : null" @tab:show="currentTab = 'locations'">
        <model-tab v-if="currentTab === 'locations'"
                   :context="context"
                   type="locations"
                   :page="homePageComponent" />
      </f7-tab>
      <f7-tab id="tab-equipment" :tab-active="currentTab === 'equipment' ? true : null" @tab:show="currentTab = 'equipment'">
        <model-tab v-if="currentTab === 'equipment'"
                   :context="context"
                   type="equipment"
                   :page="homePageComponent" />
      </f7-tab>
      <f7-tab id="tab-properties" :tab-active="currentTab === 'properties' ? true : null" @tab:show="currentTab = 'properties'">
        <model-tab v-if="currentTab === 'properties'"
                   :context="context"
                   type="properties"
                   :page="homePageComponent" />
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
import { utils } from 'framework7'
import { mapStores } from 'pinia'

import OverviewTab from './home/overview-tab.vue'
import ModelTab from './home/model-tab.vue'
import HomeCards from './home/homecards-mixin'

import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'
import { useStatesStore } from '@/js/stores/useStatesStore'
import { useUserStore } from '@/js/stores/useUserStore'
import { useComponentsStore } from '@/js/stores/useComponentsStore'
import { useRuntimeStore } from '@/js/stores/useRuntimeStore'

export default {
  props: {
    initialTab: String,
    f7route: Object,
    f7router: Object
  },
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
      overviewPageKey: utils.id()
    }
  },
  computed: {
    ready () {
      return useComponentsStore().ready && useRuntimeStore().ready
    },
    context () {
      return {
        store: useStatesStore().trackedItems
      }
    },
    simpleNavbar () {
      const homeNavBar = useUIOptionsStore().homeNavBar
      if (homeNavBar !== 'default') return homeNavBar === 'simple'
      if (this.$device.desktop) {
        return this.homePageComponent?.config?.simpleNavbarDesktopDefault === true
      } else {
        return this.homePageComponent?.config?.simpleNavbarMobileDefault === true
      }
    },
    standardBackground () {
      const homeBackground = useUIOptionsStore().homeBackground
      if (homeBackground !== 'default') return homeBackground === 'standard'
      if (this.$device.desktop) {
        return this.homePageComponent?.config?.standardBackgroundDesktopDefault === true
      } else {
        return this.homePageComponent?.config?.standardBackgroundMobileDefault === true
      }
    },
    homePageComponent () {
      const page = useComponentsStore().page('home')
      if (!page) return null
      if (page.component !== 'oh-home-page') return null
      return page
    },
    tabsVisible () {
      // Show the tabs bar if the home page component is unavailable
      if (!this.homePageComponent) return true
      // Hide the tabs bar if all model tabs are hidden
      if (this.homePageComponent.config?.hiddenModelTabs?.length === 3) return false
      // Hide the tabs bar if model cards are restricted to a role and/or users and the current users doesn't satisfy the requirements
      // Note: User configuration takes precedence over role configuration
      const visibleTo = this.homePageComponent.config.displayModelCardsTo
      if (visibleTo === undefined || !visibleTo.length) return true
      const user = useUserStore().user
      if (!user) return false
      if (user.roles && user.roles.some((r) => visibleTo.indexOf('role:' + r) >= 0)) return true
      if (visibleTo.indexOf('user:' + user.name) >= 0) return true
      return false
    },
    allowChat () {
      if (!this.homePageComponent) return true
      const visibleTo = this.homePageComponent.config.allowChatInputTo
      if (visibleTo === undefined || !visibleTo.length) return true
      const user = useUserStore().user
      if (!user) return false
      if (user.roles && user.roles.some((r) => visibleTo.indexOf('role:' + r) >= 0)) return true
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
    },
    ...mapStores(useUIOptionsStore, useUserStore, useRuntimeStore)
  },
  watch: {
    ready (val, oldVal) {
      if (val && !oldVal) {
        useStatesStore().startTrackingStates()
      }
    }
  },
  methods: {
    onPageBeforeIn () {
      this.overviewPageKey = utils.id()
    },
    onPageAfterIn () {
      if (this.ready) {
        useStatesStore().startTrackingStates()
      }
    },
    onPageBeforeOut () {
      useStatesStore().stopTrackingStates()
    },
    onPageInit () {
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
      this.f7router.updateCurrentUrl('/' + this.currentTab + '/')
      this.f7router.url = '/' + this.currentTab + '/'
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
