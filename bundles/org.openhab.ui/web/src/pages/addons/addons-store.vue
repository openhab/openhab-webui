<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut" ref="addonstore" class="page-addon-store">
    <f7-navbar large :large-transparent="true" :back-link="initialTab ? 'Settings' : 'Back'" class="store-nav">
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
    <f7-block v-if="!ready" class="text-align-center padding-top margin-top">
      <f7-block-title>
        <f7-preloader :size="30" />
        <div>Loading...</div>
      </f7-block-title>
    </f7-block>
    <f7-tabs>
      <f7-tab :tab-active="currentTab === 'bindings'">
        <addons-section
          v-if="suggestedAddons" :show-all="true"
          @addonButtonClick="addonButtonClick"
          :addons="suggestedAddons.filter((a) => a.type === 'binding')"
          :suggested="true"
          :title="'Binding Suggestions'"
          :subtitle="'Suggested bindings from network scan'" />
        <addons-section
          v-if="officialAddons"
          @addonButtonClick="addonButtonClick"
          :addons="officialAddons.filter((a) => a.type === 'binding')"
          :title="'openHAB Distribution'"
          :subtitle="'Official bindings maintained by the openHAB project'" />
        <addons-section
          v-if="addons && addons.marketplace"
          @addonButtonClick="addonButtonClick"
          :addons="addons.marketplace.filter((a) => a.type === 'binding')"
          :title="'Community Marketplace'"
          :subtitle="'Bindings independently released by the community'" />
        <addons-section
          v-if="otherAddons && otherAddons.length"
          @addonButtonClick="addonButtonClick"
          :addons="otherAddons.filter((a) => a.type === 'binding')"
          :title="'Other Add-ons'" />
      </f7-tab>
      <f7-tab :tab-active="currentTab === 'automation'">
        <addons-section
          v-if="addons"
          @addonButtonClick="addonButtonClick"
          :addons="allAddons.filter((a) => a.type === 'automation' && a.contentType !== 'application/vnd.openhab.ruletemplate' && a.contentType !== 'application/vnd.openhab.uicomponent;type=blocks')"
          :featured="['automation-jsscripting', 'automation-groovyscripting', 'automation-jrubyscripting']"
          :title="'Languages &amp; Technologies'"
          :subtitle="'Use your preferred scripting language and other automation functionality'" />
        <addons-section
          v-if="addons"
          @addonButtonClick="addonButtonClick"
          :addons="allAddons.filter((a) => a.type === 'automation' && a.contentType === 'application/vnd.openhab.ruletemplate')"
          :install-action-text="'Add'"
          :title="'Rule Templates'"
          :subtitle="'Shared by the community to bootstrap your automation'" />
        <addons-section
          v-if="addons"
          @addonButtonClick="addonButtonClick"
          :addons="allAddons.filter((a) => a.type === 'automation' && a.contentType === 'application/vnd.openhab.uicomponent;type=blocks')"
          :install-action-text="'Add'"
          :title="'Block Libraries'"
          :subtitle="'Community extensions to the Blockly toolbox'" />
      </f7-tab>
      <f7-tab :tab-active="currentTab === 'ui'">
        <addons-section
          v-if="addons && addons.marketplace"
          @addonButtonClick="addonButtonClick"
          :addons="addons.marketplace.filter((a) => a.type === 'ui' && a.contentType === 'application/vnd.openhab.uicomponent;type=widget')"
          :install-action-text="'Add'"
          :show-as-cards="true"
          :title="'Widgets for the Main UI'"
          :subtitle="'Extend your pages with these community-designed widgets'" />
        <addons-section
          v-if="addons && officialAddons" :show-all="true"
          @addonButtonClick="addonButtonClick"
          :addons="allAddons.filter((a) => a.type === 'ui' && a.contentType !== 'application/vnd.openhab.uicomponent;type=widget')"
          :title="'Other UI Add-ons'"
          :subtitle="'Alternative user interfaces and icon sets'" />
      </f7-tab>
      <f7-tab :tab-active="currentTab === 'other'">
        <addons-section
          v-if="suggestedAddons" :show-all="true"
          @addonButtonClick="addonButtonClick"
          :suggested="true"
          :addons="suggestedAddons.filter((a) => a.type === 'misc')"
          :title="'System Integrations Suggestions'"
          :subtitle="'Suggested system integrations from network scan'" />
        <addons-section
          v-if="addons && officialAddons" :show-all="true"
          @addonButtonClick="addonButtonClick"
          :addons="allAddons.filter((a) => a.type === 'misc')"
          :title="'System Integrations'"
          :featured="['misc-openhabcloud', 'misc-homekit', 'misc-metrics']"
          :subtitle="'Integrate openHAB with external systems'" />
        <addons-section
          v-if="addons && officialAddons"
          @addonButtonClick="addonButtonClick"
          :addons="allAddons.filter((a) => a.type === 'persistence')" :show-all="true"
          :featured="['persistence-rrd4j', 'persistence-influxdb', 'persistence-mongodb']"
          :title="'Persistence Services'"
          :subtitle="'Backend connectors to store historical data'" />
        <addons-section
          v-if="addons && officialAddons"
          @addonButtonClick="addonButtonClick"
          :addons="allAddons.filter((a) => a.type === 'transformation')" :show-all="true"
          :featured="['transformation-jsonpath', 'transformation-javascript', 'transformation-regex']"
          :title="'Transformation Add-ons'"
          :subtitle="'Translate raw values into processed or human-readable representations'" />
        <addons-section
          v-if="addons && officialAddons" :show-all="true"
          @addonButtonClick="addonButtonClick"
          :addons="allAddons.filter((a) => a.type === 'voice')"
          :featured="['voice-googletts', 'voice-pollytts', 'voice-voicerss']"
          :title="'Voice &amp; Speech'"
          :subtitle="'Convert between text and speech, interpret human language queries'" />
      </f7-tab>
      <f7-tab :tab-active="currentTab === 'search'" style="padding-top: 2rem">
        <addons-section
          v-if="addons && searchResults.length"
          :show-as-cards="searchResults.length <= 3"
          @addonButtonClick="addonButtonClick"
          :title="searchResults.length + ' result' + ((searchResults.length === 1) ? '' : 's')"
          :addons="searchResults" />
      </f7-tab>
    </f7-tabs>
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
      suggestedAddons: [],
      ready: false,
      searchResults: []
    }
  },
  computed: {
    allAddons () {
      return Object.keys(this.addons).flatMap((k) => this.addons[k]).filter((a) => !this.suggestedAddons.includes(a))
    },
    officialAddons () {
      return Object.keys(this.addons).filter((k) => k === 'eclipse' || k === 'karaf').flatMap((k) => this.addons[k]).filter((a) => !this.suggestedAddons.includes(a))
    },
    otherAddons () {
      return Object.keys(this.addons).filter((k) => k !== 'eclipse' && k !== 'karaf' && k !== 'marketplace').flatMap((k) => this.addons[k]).filter((a) => !this.suggestedAddons.includes(a))
    }
  },
  methods: {
    onPageAfterIn () {
      this.$f7router.updateCurrentUrl('/addons/' + this.currentTab + '/')
      this.load()
    },
    onPageBeforeOut () {
      this.stopEventSource()
    },
    load () {
      this.stopEventSource()
      this.$oh.api.get('/rest/addons/suggestions').then((data) => {
        this.$set(this, 'suggestedAddons', data)
      })
      this.$oh.api.get('/rest/addons/services').then((data) => {
        this.services = data
        Promise.all(this.services.map((s) => this.$oh.api.get('/rest/addons?serviceId=' + s.id))).then((data2) => {
          data2.forEach((addons, idx) => {
            this.$set(this.addons, data[idx].id, data2[idx])
          })
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
      this.currentTab = ''
      this.$nextTick(() => {
        this.$f7router.updateCurrentUrl('/addons/' + tab + '/')
        this.$f7.lazy.create('.page-addon-store')
        this.currentTab = tab
        if (this.currentTab === 'search') {
          this.$refs.storeSearchbar.enable()
          setTimeout(() => {
            this.$refs.storeSearchbar.f7Searchbar.$inputEl.focus()
          }, 500)
        } else {
          this.$refs.storeSearchbar.disable()
        }
      })
    },
    addonButtonClick (addon) {
      const serviceId = (addon.uid.indexOf(':') > 0) ? addon.uid.substring(0, addon.uid.indexOf(':')) : undefined
      this.openAddonPopup(addon.uid, serviceId, addon)
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
