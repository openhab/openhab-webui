<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut" ref="addonstore" class="page-addon-store">
    <f7-navbar large :large-transparent="false" back-link="Back" class="store-nav" :title-large="AddonTitles[currentTab] || 'Add-on Store'" :title="pageTitle">
      <f7-nav-right>
        <developer-dock-icon />
      </f7-nav-right>
    </f7-navbar>
    <f7-toolbar v-show="$f7.width < 1024 || !leftPanelOpened" tabbar bottom>
      <f7-link tab-link :tab-link-active="$store.state.pagePath === '/addons/'" href="/addons/" icon-ios="f7:bag_fill" icon-aurora="f7:bag_fill" icon-md="material:shopping_bag" />
      <f7-link v-for="section in Object.keys(AddonTitles)" :key="section" tab-link :tab-link-active="$store.state.pagePath === `/addons/${section}/`" :href="`/addons/${section}`" :icon-ios="`f7:${AddonIcons[section]}`" :icon-aurora="`f7:${AddonIcons[section]}`" :icon-md="`f7:${AddonIcons[section]}`" />
    </f7-toolbar>
    <f7-block class="no-padding" style="margin-top: 0">
      <f7-searchbar
        ref="storeSearchbar"
        class="searchbar-store"
        custom-search
        :placeholder="'Search ' + Object.assign({ main: 'all add-ons' }, AddonTitles)[currentTab].toLowerCase()"
        :disable-button="!$theme.aurora"
        @searchbar:search="search"
        @searchbar:clear="clearSearch" />
      <f7-list accordion-list style="margin-top: 0px; margin-bottom: 0px">
        <f7-list-item accordion-item title="Filters">
          <f7-accordion-content>
            <f7-list>
              <f7-list-item smart-select title="Connection Type" :smart-select-params="{ closeOnSelect: true, openIn: 'sheet' }">
                <select @change="updateFilter('connectionType', $event.target.value)">
                  <option v-for="type in Object.keys(AddonConnectionTypes)" :key="type" :value="type" :selected="type===connectionType">
                    {{ AddonConnectionTypes[type].label }}
                  </option>
                </select>
              </f7-list-item>
              <f7-list-item v-if="regionReady" smart-select title="Country" :smart-select-params="{ closeOnSelect: true, openIn: 'sheet' }">
                <select @change="updateFilter('regionType', $event.target.value)">
                  <option v-for="type in Object.keys(AddonRegionTypes)" :key="type" :value="type" :selected="type===regionType">
                    {{ AddonRegionTypes[type] }}
                  </option>
                </select>
              </f7-list-item>
            </f7-list>
          </f7-accordion-content>
        </f7-list-item>
      </f7-list>
    </f7-block>
    <f7-block v-if="!ready" class="text-align-center padding-top margin-top">
      <f7-block-title>
        <f7-preloader :size="30" />
        <div>Loading...</div>
      </f7-block-title>
    </f7-block>

    <!-- Search Results -->
    <div v-if="searchResults">
      <f7-block v-if="searchResults.length === 0">
        '{{ this.$refs.storeSearchbar.f7Searchbar.query }}' not found in {{ currentTab === 'main' ? 'any' : currentTab }} add-ons
        <div class="flex-shrink-0 if-aurora display-flex justify-content-center">
          <f7-button color="blue" fill raised @click="clearSearch">
            Clear Search
          </f7-button>
        </div>
      </f7-block>
      <addons-section v-else :show-as-cards="searchResults.length <= 3" :addons="searchResults"
                      :title="'Found: ' + searchResults.length + (currentTab == 'main' ? '' : ' ' + currentTab) + ' add-on' + ((searchResults.length === 1) ? '' : 's')"
                      @addonButtonClick="addonButtonClick" />
    </div>

    <f7-tabs v-show="ready && !searchResults" routable>
      <f7-tab id="main" @tabShow="onTabShow">
        <!-- Show Suggested Add-ons -->
        <addons-section
          v-for="section in Object.keys(SuggestionLabels)"
          :key="'suggested-' + section"
          :show-all="true"
          @addonButtonClick="addonButtonClick"
          :addons="suggestedAddons.filter((a) => a.type === section)"
          :suggested="true"
          :title="SuggestionLabels[section].title"
          :subtitle="SuggestionLabels[section].subtitle" />

        <!-- Show Installed Add-ons -->
        <addons-section
          v-for="section in Object.keys(AddonTitles)"
          :key="'installed-' + section"
          :show-as-cards="installedAddons.length <= 3"
          @addonButtonClick="addonButtonClick"
          :title="'Installed ' + AddonTitles[section]"
          :addons="installedAddons.filter((a) => a.type === section)" />
      </f7-tab>

      <f7-tab id="binding" @tabShow="onTabShow">
        <addons-section
          v-if="suggestedAddons" :show-all="true"
          @addonButtonClick="addonButtonClick"
          :addons="suggestedAddons.filter((a) => a.type === 'binding')"
          :suggested="true"
          :title="SuggestionLabels.binding.title"
          :subtitle="SuggestionLabels.binding.subtitle" />
        <addons-section
          v-if="officialAddons"
          @addonButtonClick="addonButtonClick"
          :addons="officialAddons.filter((a) => a.type === 'binding')"
          :title="'openHAB Distribution'"
          :subtitle="'Official bindings maintained by the openHAB project'" />
        <addons-section
          v-if="addons && addons.marketplace"
          @addonButtonClick="addonButtonClick"
          :addons="marketplaceAddons.filter((a) => a.type === 'binding')"
          :title="'Community Marketplace'"
          :subtitle="'Bindings independently released by the community'" />
        <addons-section
          v-if="otherAddons && otherAddons.length"
          @addonButtonClick="addonButtonClick"
          :addons="otherAddons.filter((a) => a.type === 'binding')"
          :title="'Other Add-ons'" />
      </f7-tab>

      <f7-tab id="automation" @tabShow="onTabShow">
        <addons-section
          v-if="addons"
          @addonButtonClick="addonButtonClick"
          :addons="allAddons.filter((a) => a.type === 'automation' && a.contentType !== 'application/vnd.openhab.ruletemplate' && a.contentType !== 'application/vnd.openhab.uicomponent;type=blocks')"
          :featured="['automation-jsscripting', 'automation-pythonscripting', 'automation-jrubyscripting', 'automation-groovyscripting']"
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

      <f7-tab id="ui" @tabShow="onTabShow">
        <addons-section
          v-if="addons && addons.marketplace"
          @addonButtonClick="addonButtonClick"
          :addons="marketplaceAddons.filter((a) => a.type === 'ui' && a.contentType === 'application/vnd.openhab.uicomponent;type=widget')"
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

      <f7-tab id="misc" @tabShow="onTabShow">
        <addons-section
          v-if="suggestedAddons" :show-all="true"
          @addonButtonClick="addonButtonClick"
          :suggested="true"
          :addons="suggestedAddons.filter((a) => a.type === 'misc')"
          :title="SuggestionLabels.misc.title"
          :subtitle="SuggestionLabels.misc.subtitle" />
        <addons-section
          v-if="addons && officialAddons" :show-all="true"
          @addonButtonClick="addonButtonClick"
          :addons="unsuggestedAddons.filter((a) => a.type === 'misc')"
          :featured="['misc-openhabcloud', 'misc-homekit', 'misc-metrics']"
          :subtitle="'Integrate openHAB with external systems'" />
      </f7-tab>

      <f7-tab id="persistence" @tabShow="onTabShow">
        <addons-section
          v-if="suggestedAddons" :show-all="true"
          @addonButtonClick="addonButtonClick"
          :suggested="true"
          :addons="suggestedAddons.filter((a) => a.type === 'persistence')"
          :title="SuggestionLabels.persistence.title"
          :subtitle="SuggestionLabels.persistence.subtitle" />
        <addons-section
          v-if="addons && officialAddons"
          @addonButtonClick="addonButtonClick"
          :addons="unsuggestedAddons.filter((a) => a.type === 'persistence')" :show-all="true"
          :featured="['persistence-rrd4j', 'persistence-influxdb', 'persistence-mapdb']"
          :title="'Persistence Services'"
          :subtitle="'Backend connectors to store historical data'" />
      </f7-tab>

      <f7-tab id="transformation" @tabShow="onTabShow">
        <addons-section
          v-if="suggestedAddons" :show-all="true"
          @addonButtonClick="addonButtonClick"
          :suggested="true"
          :addons="suggestedAddons.filter((a) => a.type === 'transformation')"
          :title="SuggestionLabels.transformation.title"
          :subtitle="SuggestionLabels.transformation.subtitle" />
        <addons-section
          v-if="addons && officialAddons"
          @addonButtonClick="addonButtonClick"
          :addons="unsuggestedAddons.filter((a) => a.type === 'transformation')" :show-all="true"
          :featured="['transformation-jsonpath', 'transformation-map', 'transformation-regex']"
          :title="'Transformation Add-ons'"
          :subtitle="'Translate raw values into processed or human-readable representations'" />
      </f7-tab>

      <f7-tab id="voice" @tabShow="onTabShow">
        <addons-section
          v-if="suggestedAddons" :show-all="true"
          @addonButtonClick="addonButtonClick"
          :suggested="true"
          :addons="suggestedAddons.filter((a) => a.type === 'voice')"
          :title="SuggestionLabels.voice.title"
          :subtitle="SuggestionLabels.voice.subtitle" />
        <addons-section
          v-if="addons && officialAddons" :show-all="true"
          @addonButtonClick="addonButtonClick"
          :addons="unsuggestedAddons.filter((a) => a.type === 'voice')"
          :featured="['voice-googletts', 'voice-pollytts', 'voice-voicerss']"
          :subtitle="'Convert between text and speech, interpret human language queries'" />
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
.searchbar-store
  margin-left 2em
  margin-right 2em
</style>

<script>
import AddonStoreMixin from './addon-store-mixin'
import AddonsSection from '@/components/addons/addons-section.vue'
import { AddonIcons, AddonTitles, AddonSuggestionLabels, AddonConnectionTypes, AddonRegionTypes } from '@/assets/addon-store'

export default {
  mixins: [AddonStoreMixin],
  props: ['searchFor'],
  components: {
    AddonsSection
  },
  data () {
    return {
      leftPanelOpened: false,
      currentTab: 'main',
      services: null,
      suggestions: [],
      ready: false,
      query: null,
      searchResults: null,
      connectionType: 'cloud',
      regionType: 'exclude_other',
      region: null,
      regionReady: false
    }
  },
  computed: {
    allAddons () {
      return Object.keys(this.addons).flatMap((k) => this.addons[k]).filter((a) => this.isInFilter(a))
    },
    installedAddons () {
      return this.allAddons.filter((a) => a.installed)
    },
    suggestedAddons () {
      return this.allAddons.filter((a) => !a.installed && this.suggestions.some((s) => s.id === a.id)).filter((a) => this.isInFilter(a))
    },
    unsuggestedAddons () {
      return this.allAddons.filter((a) => !this.suggestedAddons.includes(a)).filter((a) => this.isInFilter(a))
    },
    officialAddons () {
      return Object.keys(this.addons).filter((k) => k === 'eclipse' || k === 'karaf').flatMap((k) => this.addons[k]).filter((a) => this.isInFilter(a)).filter((a) => !this.suggestedAddons.includes(a))
    },
    marketplaceAddons () {
      return this.addons.marketplace.filter((a) => !this.suggestedAddons.includes(a)).filter((a) => this.isInFilter(a))
    },
    otherAddons () {
      return Object.keys(this.addons).filter((k) => k !== 'eclipse' && k !== 'karaf' && k !== 'marketplace').flatMap((k) => this.addons[k]).filter((a) => this.isInFilter(a)).filter((a) => !this.suggestedAddons.includes(a))
    },
    pageTitle () {
      if (!AddonTitles[this.currentTab]) return 'Add-on Store'
      return AddonTitles[this.currentTab].replace(/s$/, '') + ' Add-ons'
    },
    connectionTypes () {
      return this.AddonConnectionTypes[this.connectionType].values
    }
  },
  methods: {
    onPageAfterIn () {
      this.load()
    },
    onPageBeforeOut () {
      this.stopEventSource()
      this.$f7.panel.get('left').off('opened closed', this.updateLeftPanelVisibility)
    },
    updateLeftPanelVisibility () {
      this.leftPanelOpened = this.$f7.panel.get('left').opened
    },
    load () {
      if (this.searchFor) {
        // Show this in the searchbar while the page is loading
        this.$refs.storeSearchbar.f7Searchbar.$inputEl.val(this.searchFor)
      }
      this.updateLeftPanelVisibility()
      this.$f7.panel.get('left').on('opened closed', this.updateLeftPanelVisibility)
      this.stopEventSource()
      this.$oh.api.get('/rest/services/org.openhab.i18n/config').then((data) => {
        if (data.region) {
          this.region = data.region
          this.regionReady = true
        }
      })
      this.$oh.api.get('/rest/addons/suggestions').then((data) => {
        this.$set(this, 'suggestions', data)
      })
      this.$oh.api.get('/rest/addons/services').then((data) => {
        this.services = data
        Promise.all(this.services.map((s) => this.$oh.api.get('/rest/addons?serviceId=' + s.id))).then((data2) => {
          data2.forEach((addons, idx) => {
            this.$set(this.addons, data[idx].id, data2[idx])
          })
          this.ready = true
          this.startEventSource()
          this.$nextTick(() => {
            this.$f7.lazy.create('.page-addon-store')
            if (this.searchFor) {
              this.$refs.storeSearchbar.search(this.searchFor)
            }
          })
        })
      })
    },
    addonButtonClick (addon) {
      const serviceId = (addon.uid.indexOf(':') > 0) ? addon.uid.substring(0, addon.uid.indexOf(':')) : undefined
      this.openAddonPopup(addon.uid, serviceId, addon)
    },
    onTabShow (tab) {
      this.currentTab = tab.id

      const section = tab.id === 'main' ? '' : (tab.id + '/')
      this.$f7router.updateCurrentUrl('/addons/' + section)
      this.$f7router.url = '/' + this.currentTab

      this.clearSearch()

      this.$nextTick(() => {
        this.$f7.lazy.create('.page-addon-store')
      })
    },
    search (searchbar, query, previousQuery) {
      if (!this.ready) return

      query = query.trim()
      if (!query) {
        this.clearSearch()
        return
      }

      let results = this.allAddons
      if (this.currentTab !== 'main') {
        results = results.filter((a) => a.type === this.currentTab)
      }
      query = query.toLowerCase()
      results = results.filter((a) => a.id.includes(query) || a.label.toLowerCase().includes(query) || a.description?.toLowerCase()?.includes(query))

      this.$set(this, 'query', query)
      this.$set(this, 'searchResults', results)
      setTimeout(() => {
        this.$f7.lazy.create('.page-addon-store')
      }, 100)
    },
    clearSearch (searchbar, previousQuery) {
      this.$refs.storeSearchbar.f7Searchbar.$inputEl.val('')
      this.$set(this, 'query', null)
      this.$set(this, 'searchResults', null)
      if (this.$device.desktop) {
        this.$nextTick(() => {
          this.$refs.storeSearchbar.f7Searchbar.$inputEl.focus()
        })
      }
    },
    updateFilter (filter, value) {
      this.$set(this, filter, value)
      if (this.query) {
        this.$nextTick(() => {
          this.search(undefined, this.query)
        })
      }
    },
    isInFilter (addon) {
      // For now, we don't filter rule templates, UI widgets and block libraries, although there might be cases where they could use a cloud service,
      // or be specific to a region/country.
      // No connection or countries field is available for these addons.
      const isLibraryContentType = ['application/vnd.openhab.ruletemplate', 'application/vnd.openhab.uicomponent'].includes(addon.contentType.split(';')[0])
      // Note only the addons from the distribution currently have the connection attribute.
      // Therefore marketplace or alternative store addons will only be visible with a selection that allows cloud connections.
      const isInConnectionFilter = isLibraryContentType ? true : (this.connectionTypes.includes(addon.connection) || this.connectionTypes.includes('cloud'))
      // Filter according to region/country. Don't filter if no region/country set for OH.
      // Note only the addons from the distribution currently have the countries attribute.
      let isInRegionFilter = true
      if (this.regionReady) {
        if (this.regionType === 'exclude_other') {
          isInRegionFilter = addon.countries.length > 0 ? addon.countries.map(c => c.toUpperCase()).includes(this.region.toUpperCase()) : true
        } else if (this.regionType === 'only_region') {
          isInRegionFilter = addon.countries.map(c => c.toUpperCase()).includes(this.region.toUpperCase())
        }
      }
      return isInConnectionFilter && isInRegionFilter
    }
  },
  created () {
    this.AddonIcons = AddonIcons
    this.AddonTitles = AddonTitles
    this.SuggestionLabels = AddonSuggestionLabels
    this.AddonConnectionTypes = AddonConnectionTypes
    this.AddonRegionTypes = AddonRegionTypes
  }
}
</script>
