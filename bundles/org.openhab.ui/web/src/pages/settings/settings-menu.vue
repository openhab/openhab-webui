<template>
  <f7-page @page:init="onPageInit" @page:afterin="onPageAfterIn" class="page-settings">
    <f7-navbar large :large-transparent="false" title-large="Settings" title="Settings" back-link="Back" back-link-url="/home/" back-link-force>
      <f7-nav-right>
        <f7-link
          class="searchbar-enable"
          data-searchbar=".searchbar-demo"
          icon-ios="f7:search_strong"
          icon-aurora="f7:search_strong"
          icon-md="material:search" />
      </f7-nav-right>
      <f7-searchbar
        class="searchbar-demo"
        expandable
        search-container=".search-list"
        search-in=".item-title"
        :disable-button="!$theme.aurora" />
    </f7-navbar>
    <f7-block class="block-narrow settings-menu" v-show="servicesLoaded && addonsLoaded">
      <f7-row>
        <f7-col width="100" medium="50">
          <f7-block-title>Configuration</f7-block-title>
          <f7-list media-list class="search-list">
            <f7-list-item
              v-if="$store.getters.apiEndpoint('things')"
              media-item
              link="things/"
              title="Things"
              :badge="(inboxCount > 0) ? inboxCount : undefined"
              :after="(inboxCount > 0) ? undefined : thingsCount"
              :badge-color="inboxCount ? 'red' : 'blue'"
              :footer="objectsSubtitles.things">
              <f7-icon slot="media" f7="lightbulb" color="gray" />
            </f7-list-item>
            <f7-list-item
              v-if="$store.getters.apiEndpoint('items')"
              media-item
              link="model/"
              title="Model"
              badge-color="blue"
              :footer="objectsSubtitles.model">
              <f7-icon slot="media" f7="list_bullet_indent" color="gray" />
            </f7-list-item>
            <f7-list-item
              v-if="$store.getters.apiEndpoint('items')"
              media-item
              link="items/"
              title="Items"
              :after="itemsCount"
              badge-color="blue"
              :footer="objectsSubtitles.items">
              <f7-icon slot="media" f7="square_on_circle" color="gray" />
            </f7-list-item>
            <f7-list-item
              v-if="$store.getters.apiEndpoint('ui')"
              link="pages/"
              title="Pages"
              :after="$store.getters.pages.length + sitemapsCount"
              badge-color="blue"
              :footer="objectsSubtitles.pages">
              <f7-icon slot="media" f7="tv" color="gray" />
            </f7-list-item>
          </f7-list>
          <f7-list media-list class="search-list">
            <f7-list-item
              v-if="$store.getters.apiEndpoint('transformations')"
              media-item
              link="transformations/"
              title="Transformations"
              :after="transformationsCount"
              badge-color="blue"
              :footer="objectsSubtitles.transform">
              <f7-icon slot="media" f7="function" color="gray" />
            </f7-list-item>
          </f7-list>
          <f7-block-title v-if="$store.getters.apiEndpoint('rules')">
            Automation
          </f7-block-title>
          <f7-list media-list class="search-list">
            <f7-list-item
              media-item
              link="rules/"
              title="Rules"
              :after="rulesCount"
              badge-color="blue"
              :footer="objectsSubtitles.rules">
              <f7-icon slot="media" f7="wand_stars" color="gray" />
            </f7-list-item>
            <f7-list-item
              media-item
              link="scenes/"
              title="Scenes"
              :after="scenesCount"
              badge-color="blue"
              :footer="objectsSubtitles.scenes">
              <f7-icon slot="media" f7="film" color="gray" />
            </f7-list-item>
            <f7-list-item
              media-item
              link="scripts/"
              title="Scripts"
              :after="scriptsCount"
              badge-color="blue"
              :footer="objectsSubtitles.scripts">
              <f7-icon slot="media" f7="doc_plaintext" color="gray" />
            </f7-list-item>
            <f7-list-item
              media-item
              link="schedule/"
              title="Schedule"
              badge-color="blue"
              :footer="objectsSubtitles.schedule">
              <f7-icon slot="media" f7="calendar" color="gray" />
            </f7-list-item>
          </f7-list>
          <f7-block-title v-if="$store.getters.apiEndpoint('addons')">
            Add-on Store
          </f7-block-title>
          <f7-list media-list class="search-list"
                   v-if="$store.getters.apiEndpoint('addons')">
            <f7-list-item
              media-item
              v-for="shortcut in addonStoreTabShortcuts"
              :key="shortcut.id"
              :link="true"
              @click="navigateToStore(shortcut.id)"
              :title="shortcut.label"
              :footer="shortcut.subtitle">
              <f7-icon slot="media" :f7="shortcut.icon" color="gray" />
            </f7-list-item>
          </f7-list>
        </f7-col>
        <f7-col width="100" medium="50">
          <div v-if="$store.getters.apiEndpoint('services') && servicesLoaded">
            <f7-block-title>System Settings</f7-block-title>
            <f7-list class="search-list">
              <f7-list-item
                v-for="service in systemServices"
                :key="service.id"
                :link="'services/' + service.id"
                :title="service.label" />
            </f7-list>
          </div>
          <div v-if="$store.getters.apiEndpoint('addons') && addonsLoaded">
            <f7-block-title>
              Add-on Settings
            </f7-block-title>
            <f7-list class="search-list">
              <f7-list-item
                v-for="a in addonsSettings"
                :key="a.uid"
                :link="'addons/' + a.uid + '/config'"
                :title="a.label" />
              <f7-list-button v-if="!showingAll('addonsInstalled')" color="blue" @click="$set(expandedTypes, 'addonsInstalled', true)">
                Show Advanced
              </f7-list-button>
              <f7-list-button v-if="showingAll('addonsInstalled')" color="red" @click="$set(expandedTypes, 'addonsInstalled', false)">
                Hide Advanced
              </f7-list-button>
            </f7-list>
          </div>
        </f7-col>
      </f7-row>
      <f7-block-footer v-if="$t('home.overview.title') !== 'Overview'" class="margin text-align-center">
        <small v-t="'admin.notTranslatedYet'" />
      </f7-block-footer>
    </f7-block>
  </f7-page>
</template>

<script>
import { AddonStoreTabShortcuts } from '@/assets/addon-store'

export default {
  data () {
    return {
      addonsLoaded: false,
      servicesLoaded: false,
      addonStoreTabShortcuts: AddonStoreTabShortcuts,
      addonsInstalled: [],
      addonsServices: [],
      systemServices: [],
      objectsSubtitles: {
        things: 'Manage the physical layer',
        model: 'The semantic model of your home',
        items: 'Manage the functional layer',
        pages: 'Design displays for user control & monitoring',
        transform: 'Make raw data human-readable',
        rules: 'Automate with triggers and actions',
        scenes: 'Store a set of desired states as a scene',
        scripts: 'Rules dedicated to running code',
        schedule: 'View upcoming time-based rules'
      },
      inboxCount: '',
      thingsCount: '',
      itemsCount: '',
      transformationsCount: '',
      sitemapsCount: 0,
      rulesCount: '',
      scenesCount: '',
      scriptsCount: '',

      expandedTypes: {}
    }
  },
  computed: {
    apiEndpoints () {
      return this.$store.state.apiEndpoints
    },
    addonsSettings () {
      if (this.expandedTypes.addonsInstalled) return this.addonsInstalled
      return this.addonsInstalled.filter((a) =>
        a.type === 'persistence' ||
        this.addonsServices.findIndex((as) => as.configDescriptionURI === a.uid.replace('-', ':')) > -1
      )
    }
  },
  watch: {
    apiEndpoints () {
      this.loadMenu()
      this.loadCounters()
    }
  },
  methods: {
    loadMenu () {
      if (!this.apiEndpoints) return

      const servicesPromise = (this.$store.getters.apiEndpoint('services')) ? this.$oh.api.get('/rest/services') : Promise.resolve([])
      const addonsPromise = (this.$store.getters.apiEndpoint('addons')) ? this.$oh.api.get('/rest/addons') : Promise.resolve([])

      // can be done in parallel!
      servicesPromise.then((data) => {
        this.systemServices = data.filter(s => s.category === 'system')
        this.addonsServices = data.filter(s => s.category !== 'system')
        this.servicesLoaded = true
      })
      addonsPromise.then((data) => {
        this.addonsInstalled = data.filter(a => a.installed === true)
        this.addonsLoaded = true
      })
    },
    loadCounters () {
      if (!this.apiEndpoints) return
      if (this.$store.getters.apiEndpoint('inbox')) this.$oh.api.get('/rest/inbox').then((data) => { this.inboxCount = data.filter((e) => e.flag === 'NEW').length.toString() })
      if (this.$store.getters.apiEndpoint('things')) this.$oh.api.get('/rest/things?staticDataOnly=true').then((data) => { this.thingsCount = data.length.toString() })
      if (this.$store.getters.apiEndpoint('items')) this.$oh.api.get('/rest/items?staticDataOnly=true').then((data) => { this.itemsCount = data.length.toString() })
      if (this.$store.getters.apiEndpoint('ui')) this.$oh.api.get('/rest/ui/components/system:sitemap').then((data) => { this.sitemapsCount = data.length })
      if (this.$store.getters.apiEndpoint('transformations')) this.$oh.api.get('/rest/transformations').then((data) => { this.transformationsCount = data.length.toString() })
      if (this.$store.getters.apiEndpoint('rules')) {
        this.$oh.api.get('/rest/rules?staticDataOnly=true').then((data) => {
          this.rulesCount = data.filter((r) => r.tags.indexOf('Scene') < 0 && r.tags.indexOf('Script') < 0).length.toString()
          this.scenesCount = data.filter((r) => r.tags.indexOf('Scene') >= 0).length.toString()
          this.scriptsCount = data.filter((r) => r.tags.indexOf('Script') >= 0).length.toString()
        })
      }
    },
    showingAll (type) {
      return (this.expandedTypes[type] || this[type].length <= 5)
    },
    navigateToStore (tab) {
      this.$f7.views.main.router.navigate('addons', { props: { initialTab: tab } })
    },
    onPageInit () {
      this.loadMenu()
    },
    onPageAfterIn () {
      // this.loadMenu()
      this.loadCounters()
    }
  }
}
</script>

<style lang="stylus">
.device-desktop .settings-menu
  --f7-list-item-footer-line-height 1.3
.settings-menu .icon
  color var(--f7-color-blue)
.theme-filled .settings-menu .icon
  color var(--f7-color-gray) !important
.aurora .settings-menu .icon
  font-size 24px
</style>
