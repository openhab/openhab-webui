<template>
  <f7-page @page:init="onPageInit" @page:afterin="onPageAfterIn" class="page-settings">
    <f7-navbar large :large-transparent="false" title-large="Settings" title="Settings" back-link="Back" back-link-url="/home/" back-link-force>
      <f7-nav-right>
        <f7-link
          class="searchbar-enable"
          data-searchbar=".searchbar-demo"
          icon-ios="f7:search_strong"
          icon-aurora="f7:search_strong"
          icon-md="material:search"
        />
      </f7-nav-right>
      <f7-searchbar
        class="searchbar-demo"
        expandable
        search-container=".search-list"
        search-in=".item-title"
        :disable-button="!$theme.aurora"
      />
    </f7-navbar>
    <f7-block class="block-narrow after-big-title settings-menu" v-show="addonsLoaded && servicesLoaded">
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
              :footer="objectsSubtitles.things"
            >
              <f7-icon slot="media" f7="lightbulb" color="gray" />
            </f7-list-item>
            <f7-list-item
              v-if="$store.getters.apiEndpoint('items')"
              media-item
              link="model/"
              title="Model"
              badge-color="blue"
              :footer="objectsSubtitles.model"
            >
              <f7-icon slot="media" f7="list_bullet_indent" color="gray" />
            </f7-list-item>
            <f7-list-item
              v-if="$store.getters.apiEndpoint('items')"
              media-item
              link="items/"
              title="Items"
              :after="itemsCount"
              badge-color="blue"
              :footer="objectsSubtitles.items"
            >
              <f7-icon slot="media" f7="square_on_circle" color="gray" />
            </f7-list-item>
            <f7-list-item
              v-if="$store.getters.apiEndpoint('ui')"
              link="pages/"
              title="Pages"
              :after="$store.getters.pages.length + sitemapsCount"
              badge-color="blue"
              :footer="objectsSubtitles.pages"
            >
              <f7-icon slot="media" f7="tv" color="gray" />
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
              badge-color="blue"
              :footer="objectsSubtitles.rules"
            >
              <f7-icon slot="media" f7="wand_stars" color="gray" />
            </f7-list-item>
            <f7-list-item
              media-item
              link="scripts/"
              title="Scripts"
              badge-color="blue"
              :footer="objectsSubtitles.scripts"
            >
              <f7-icon slot="media" f7="doc_plaintext" color="gray" />
            </f7-list-item>
            <f7-list-item
              media-item
              link="schedule/"
              title="Schedule"
              badge-color="blue"
              :footer="objectsSubtitles.schedule"
            >
              <f7-icon slot="media" f7="calendar" color="gray" />
            </f7-list-item>
          </f7-list>
          <f7-block-title v-if="$store.getters.apiEndpoint('addons') && addonsLoaded">
            Add-ons
          </f7-block-title>
          <f7-list media-list class="search-list"
                   v-if="$store.getters.apiEndpoint('addons')"
          >
            <f7-list-item
              media-item
              v-for="type in addonTypes"
              :key="type.id"
              :link="'addons/' + type.id"
              :title="type.label"
              :footer="addonsSubtitles[type.id]"
            >
              <f7-icon slot="media" :f7="addonsIcons[type.id]" color="gray" />
            </f7-list-item>
          </f7-list>
        </f7-col>
        <f7-col width="100" medium="50" v-if="$store.getters.apiEndpoint('services') && servicesLoaded">
          <f7-block-title>System Services</f7-block-title>
          <f7-list class="search-list">
            <f7-list-item
              v-for="service in systemServices"
              :key="service.id"
              :link="'services/' + service.id"
              :title="service.label"
            />
          </f7-list>
          <f7-block-title>Other Services</f7-block-title>
          <f7-list class="search-list">
            <f7-list-item
              v-for="service in otherServices"
              :key="service.id"
              :link="'services/' + service.id"
              :title="service.label"
            />
          </f7-list>
        </f7-col>
      </f7-row>
      <f7-block-footer v-if="$t('home.overview.title') !== 'Overview'" class="margin text-align-center">
        <small v-t="'admin.notTranslatedYet'" />
      </f7-block-footer>
    </f7-block>
  </f7-page>
</template>

<script>
export default {
  data () {
    return {
      addonsLoaded: false,
      servicesLoaded: false,
      addonTypes: {},
      systemServices: [],
      otherServices: [],
      objectsSubtitles: {
        things: 'Manage the physical layer',
        model: 'The semantic model of your home',
        items: 'Manage the functional layer',
        pages: 'Design displays for user control & monitoring',
        rules: 'Automate with triggers and actions',
        scripts: 'Rules dedicated to running code',
        schedule: 'View upcoming time-based rules'
      },
      addonsSubtitles: {
        automation: 'Scripting languages and module types for rules',
        binding: 'Connect and control hardware and online services',
        persistence: 'Backend connectors to store historical data',
        transformation: 'Translate between technical and human-readable values',
        misc: 'Integrations to external systems and more',
        ui: 'Alternative frontends for user interaction',
        voice: 'Convert between text and speech, interpret human language queries'
      },
      addonsIcons: {
        automation: 'sparkles',
        binding: 'circle_grid_hex',
        persistence: 'download_circle',
        transformation: 'function',
        misc: 'rectangle_3_offgrid',
        ui: 'play_rectangle',
        voice: 'chat_bubble_2'
      },
      inboxCount: '',
      thingsCount: '',
      itemsCount: '',
      sitemapsCount: 0
    }
  },
  computed: {
    apiEndpoints () {
      return this.$store.state.apiEndpoints
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
      const addonsPromise = (this.$store.getters.apiEndpoint('addons')) ? this.$oh.api.get('/rest/addons/types') : Promise.resolve([])

      // can be done in parallel!
      servicesPromise.then((data) => {
        this.systemServices = data.filter(s => s.category === 'system')
        this.otherServices = data.filter(s => s.category !== 'system')
        this.servicesLoaded = true
      })
      addonsPromise.then((data) => {
        this.addonTypes = data
        this.addonsLoaded = true
      }).catch((err) => {
        console.warn('Add-on types not loaded: ' + err)
        this.addonTypes = []
        this.addonsLoaded = true
      })
    },
    loadCounters () {
      if (!this.apiEndpoints) return
      if (this.$store.getters.apiEndpoint('inbox')) this.$oh.api.get('/rest/inbox').then((data) => { this.inboxCount = data.filter((e) => e.flag === 'NEW').length.toString() })
      if (this.$store.getters.apiEndpoint('things')) this.$oh.api.get('/rest/things?summary=true').then((data) => { this.thingsCount = data.length.toString() })
      if (this.$store.getters.apiEndpoint('items')) this.$oh.api.get('/rest/items').then((data) => { this.itemsCount = data.length.toString() })
      if (this.$store.getters.apiEndpoint('ui')) this.$oh.api.get('/rest/ui/components/system:sitemap?summary=true').then((data) => { this.sitemapsCount = data.length })
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
