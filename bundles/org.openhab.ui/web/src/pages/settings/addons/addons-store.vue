<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut" ref="addonstore" class="page-addon-store">
    <f7-navbar large :large-transparent="true" back-link="Back" back-link-url="/settings/" back-link-force class="store-nav">
      <f7-nav-title-large class="store-title-large">
        <span v-if="currentTab === 'bindings'">Bindings</span>
        <span v-if="currentTab === 'automation'">Automation</span>
        <span v-if="currentTab === 'ui'">User Interfaces</span>
        <span v-if="currentTab === 'other'">Other Add-ons</span>
        <span v-if="currentTab === 'search'">Search</span>
      </f7-nav-title-large>
      <f7-nav-title>
        <span v-if="currentTab === 'bindings'">Bindings</span>
        <span v-if="currentTab === 'automation'">Automation</span>
        <span v-if="currentTab === 'ui'">User Interfaces</span>
        <span v-if="currentTab === 'other'">Other Add-ons</span>
        <span v-if="currentTab === 'search'">Search</span>
      </f7-nav-title>
      <f7-nav-right>
        <f7-link
          v-show="currentTab === 'search'"
          class="searchbar-enable"
          data-searchbar=".searchbar-store"
          icon-ios="f7:search_strong"
          icon-aurora="f7:search_strong"
          icon-md="material:search" />
      </f7-nav-right>
      <f7-searchbar
        ref="storeSearchbar"
        class="searchbar-store"
        placeholder="Search add-ons"
        expandable
        custom-search
        search-in=".item-title"
        :disable-button="!$theme.aurora"
        @searchbar:search="search" @searchbar:clear="clearSearch" />
    </f7-navbar>
    <f7-toolbar tabbar labels bottom>
      <f7-link tab-link @click="switchTab('bindings')" :tab-link-active="currentTab === 'bindings'" icon-ios="f7:circle_grid_hex_fill" icon-aurora="f7:circle_grid_hex_fill" icon-md="f7:circle_grid_hex_fill" text="Bindings" />
      <f7-link tab-link @click="switchTab('automation')" :tab-link-active="currentTab === 'automation'" icon-ios="f7:sparkles" icon-aurora="f7:sparkles" icon-md="f7:sparkles" text="Automation" />
      <f7-link tab-link @click="switchTab('ui')" :tab-link-active="currentTab === 'ui'" icon-ios="f7:play_rectangle_fill" icon-aurora="f7:play_rectangle_fill" icon-md="f7:play_rectangle_fill" text="UI" />
      <f7-link tab-link @click="switchTab('other')" :tab-link-active="currentTab === 'other'" icon-ios="f7:ellipsis" icon-aurora="f7:ellipsis" icon-md="f7:ellipsis" text="Other" />
      <f7-link tab-link @click="switchTab('search')" :tab-link-active="currentTab === 'search'" icon-ios="f7:search" icon-aurora="f7:search" icon-md="f7:search" text="Search" />
    </f7-toolbar>
    <f7-block v-if="!ready" class="text-align-center">
      <f7-block-title>
        <f7-preloader />
        <div>Loading...</div>
      </f7-block-title>
    </f7-block>
    <div v-show="currentTab === 'bindings'">
      <addons-section
        v-if="addons && addons.karaf"
        @addonButtonClick="addonButtonClick"
        :addons="addons.karaf.filter((a) => a.type === 'binding')"
        :title="'openHAB Distribution'"
        :subtitle="'Official bindings maintained by the openHAB project'" />
      <addons-section
        v-if="addons && addons.marketplace"
        @addonButtonClick="addonButtonClick"
        :addons="addons.marketplace.filter((a) => a.type === 'binding')"
        :title="'Community Marketplace'"
        :subtitle="'Bindings independently released by the community'" />
    </div>
    <div v-show="currentTab === 'automation'">
      <addons-section
        v-if="addons && addons.marketplace"
        @addonButtonClick="addonButtonClick"
        :addons="addons.marketplace.filter((a) => a.type === 'automation')"
        :title="'Rule Templates'"
        :subtitle="'Shared by the community to bootstrap your automation'" />
      <addons-section
        v-if="addons && addons.karaf"
        :addons="addons.karaf.filter((a) => a.type === 'automation')"
        :title="'Automation Add-ons'"
        :subtitle="'Add functionality with add-ons from the distribution'" />
    </div>
    <div v-show="currentTab === 'ui'">
      <addons-section
        v-if="addons && addons.marketplace" v-show="currentTab === 'ui'"
        @addonButtonClick="addonButtonClick"
        :addons="addons.marketplace.filter((a) => a.type === 'ui' && a.contentType === 'application/vnd.openhab.uicomponent;type=widget')"
        :show-as-cards="true"
        :title="'Widgets for the Main UI'"
        :subtitle="'Extend your pages with these community-designed widgets'" />
      <addons-section
        v-if="addons && addons.karaf" v-show="currentTab === 'ui'" :show-all="true"
        @addonButtonClick="addonButtonClick"
        :addons="addons.karaf.filter((a) => a.type === 'ui')"
        :title="'Other User Interfaces'"
        :subtitle="'Official add-ons from the distribution'" />
    </div>
    <div v-show="currentTab === 'other'">
      <addons-section
        v-if="addons && addons.karaf" :show-all="true"
        @addonButtonClick="addonButtonClick"
        :addons="addons.karaf.filter((a) => a.type === 'misc')"
        :title="'System Integrations'"
        :featured="['misc-openhabcloud', 'misc-homekit', 'misc-metrics']"
        :subtitle="'Integrate openHAB with external systems'" />
      <addons-section
        v-if="addons && addons.karaf"
        @addonButtonClick="addonButtonClick"
        :addons="addons.karaf.filter((a) => a.type === 'persistence')" :show-all="true"
        :title="'Persistence Services'"
        :subtitle="'Backend connectors to store historical data'" />
      <addons-section
        v-if="addons && addons.karaf"
        @addonButtonClick="addonButtonClick"
        :addons="addons.karaf.filter((a) => a.type === 'transformation')" :show-all="true"
        :title="'Transformation Add-ons'"
        :subtitle="'Backend connectors to store historical data'" />
      <addons-section
        v-if="addons && addons.karaf" :show-all="true"
        @addonButtonClick="addonButtonClick"
        :addons="addons.karaf.filter((a) => a.type === 'voice')"
        :title="'Voice &amp; Speech'"
        :subtitle="'Convert between text and speech, interpret human language queries'" />
    </div>
    <div v-show="currentTab === 'search'" style="padding-top: 2rem">
      <addons-section
        v-if="addons && searchResults.length"
        :show-as-cards="searchResults.length <= 3"
        @addonButtonClick="addonButtonClick"
        :title="searchResults.length + ' result' + ((searchResults.length === 1) ? '' : 's')"
        :addons="searchResults" />
    </div>
    <addon-details-sheet
      v-if="ready"
      :addon-id="currentAddonId"
      :service-id="currentServiceId"
      :opened="addonPopupOpened"
      @closed="addonPopupOpened = false"
      @install="installAddon"
      @uninstall="uninstallAddon" />
  </f7-page>
</template>

<style lang="stylus">
.theme-filled .store-nav .store-title-large .title-large-text
  color var(--f7-text-color)
.theme-filled .store-nav.navbar-large:not(.navbar-large-collapsed) .link
  color var(--f7-theme-color)
  transition color 0.3s
.theme-filled .store-nav.navbar-large.navbar-large-collapsed .link
  color var(--f7-navbar-link-color)
  transition color 0.3s
</style>

<script>
import AddonStoreMixin from './addon-store-mixin'
import AddonsSection from '@/components/addons/addons-section.vue'

export default {
  mixins: [AddonStoreMixin],
  props: ['initialTab'],
  components: {
    AddonsSection
  },
  data () {
    return {
      currentTab: this.initialTab || 'bindings',
      services: null,
      ready: false,
      searchResults: []
    }
  },
  methods: {
    onPageAfterIn () {
      this.load()
    },
    onPageBeforeOut () {
      this.stopEventSource()
    },
    load () {
      this.stopEventSource()
      this.$oh.api.get('/rest/addons/services').then((data) => {
        this.services = data
        Promise.all(this.services.map((s) => this.$oh.api.get('/rest/addons?serviceId=' + s.id))).then((data2) => {
          data2.forEach((addons, idx) => {
            this.$set(this.addons, data[idx].id, data2[idx])
          })
          console.log(this.addons)
          this.ready = true
          this.startEventSource()
          setTimeout(() => {
            this.$f7.lazy.create('.page-addon-store')
          }, 100)
          if (this.currentTab === 'search') {
            const searchbar = this.$refs.storeSearchbar.f7Searchbar
            const filterQuery = searchbar.query
            this.search(this.$refs.storeSearchbar.$el, filterQuery)
          }
        })
      })
    },
    switchTab (tab) {
      this.currentTab = tab
      this.$f7.lazy.create('.page-addon-store')
      if (this.currentTab === 'search') {
        this.$refs.storeSearchbar.enable()
        setTimeout(() => {
          this.$refs.storeSearchbar.f7Searchbar.$inputEl.focus()
        }, 500)
      } else {
        this.$refs.storeSearchbar.disable()
      }
    },
    addonButtonClick (addon) {
      const realAddonId = (addon.id.indexOf(':') > 0) ? addon.id.substring(addon.id.indexOf(':') + 1) : addon.id
      const serviceId = (addon.id.indexOf(':') > 0) ? addon.id.substring(0, addon.id.indexOf(':')) : undefined
      this.openAddonPopup(realAddonId, serviceId, addon)
    },
    search (searchbar, query, previousQuery) {
      let results = []
      if (query) {
        for (const service in this.addons) {
          results = results.concat(this.addons[service].filter((a) => a.label.toLowerCase().indexOf(query.toLowerCase()) >= 0))
        }
      }
      this.$set(this, 'searchResults', results)
      setTimeout(() => {
        this.$f7.lazy.create('.page-addon-store')
      }, 100)
    },
    clearSearch () {

    }
  }
}
</script>
