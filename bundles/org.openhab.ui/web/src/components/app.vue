<template>
  <f7-app v-if="init" :style="{ visibility: (($store.getters.user || $store.getters.page('overview')) || communicationFailureMsg) ? '' : 'hidden' }" :params="f7params" :class="{ 'theme-dark': this.themeOptions.dark === 'dark', 'theme-filled': this.themeOptions.bars === 'filled' }">
    <!-- Left Panel -->
    <f7-panel v-show="ready" left :cover="showSidebar" class="sidebar" :visible-breakpoint="1024">
      <f7-page>
        <f7-link href="/overview" class="openhab-logo no-ripple" panel-close v-if="themeOptions.dark === 'dark'">
          <div class="logo-inner">
            <img src="@/images/openhab-logo-white.svg" type="image/svg+xml" width="196px">
          </div>
        </f7-link>
        <f7-link href="/overview" class="openhab-logo no-ripple" panel-close v-else>
          <div class="logo-inner">
            <img src="@/images/openhab-logo.svg" type="image/svg+xml" width="196px">
          </div>
        </f7-link>
        <f7-list v-if="ready">
          <f7-list-item v-if="$store.getters.apiEndpoint('ui') && (!pages || !pages.length)">
            <span><em>{{ $t('sidebar.noPages') }}</em></span>
          </f7-list-item>
          <f7-list-item v-for="page in pages" :animate="false" :key="page.uid"
                        :class="{ currentsection: currentUrl === '/page/' + page.uid || currentUrl.indexOf('/page/' + page.uid + '/') === 0 }"
                        :link="'/page/' + page.uid"
                        :title="page.config.label" view=".view-main" panel-close>
            <oh-icon slot="media" :icon="pageIcon(page)" height="18" width="18" />
          </f7-list-item>
        </f7-list>
        <f7-block-title v-if="$store.getters.isAdmin" v-t="'sidebar.administration'" />
        <!-- Settings -->
        <f7-list class="admin-links" v-if="$store.getters.isAdmin">
          <f7-list-item link="/settings/" :title="$t('sidebar.settings')" view=".view-main" panel-close :animate="false"
                        :class="{ currentsection: currentUrl === '/settings/' || currentUrl.indexOf('/settings/services/') === 0 || currentUrl.indexOf('/settings/addons/') === 0 || currentUrl.indexOf('/settings/persistence/') === 0 }">
            <f7-icon slot="media" ios="f7:gear_alt_fill" aurora="f7:gear_alt_fill" md="material:settings" color="gray" />
          </f7-list-item>
          <li v-if="showSettingsSubmenu">
            <ul class="menu-sublinks">
              <f7-list-item v-if="$store.getters.apiEndpoint('things')" link="/settings/things/" title="Things" view=".view-main" panel-close :animate="false" no-chevron
                            :class="{ currentsection: currentUrl.indexOf('/settings/things') === 0 }">
                <f7-icon slot="media" f7="lightbulb" color="gray" />
              </f7-list-item>
              <f7-list-item v-if="$store.getters.apiEndpoint('items')" link="/settings/model/" title="Model" view=".view-main" panel-close :animate="false" no-chevron
                            :class="{ currentsection: currentUrl.indexOf('/settings/model') === 0 }">
                <f7-icon slot="media" f7="list_bullet_indent" color="gray" />
              </f7-list-item>
              <f7-list-item v-if="$store.getters.apiEndpoint('items')" link="/settings/items/" title="Items" view=".view-main" panel-close :animate="false" no-chevron
                            :class="{ currentsection: currentUrl.indexOf('/settings/items') === 0 }">
                <f7-icon slot="media" f7="square_on_circle" color="gray" />
              </f7-list-item>
              <f7-list-item v-if="$store.getters.apiEndpoint('ui')" link="/settings/pages/" title="Pages" view=".view-main" panel-close :animate="false" no-chevron
                            :class="{ currentsection: currentUrl.indexOf('/settings/pages') === 0 }">
                <f7-icon slot="media" f7="tv" color="gray" />
              </f7-list-item>
              <f7-list-item v-if="$store.getters.apiEndpoint('rules')" link="/settings/rules/" title="Rules" view=".view-main" panel-close :animate="false" no-chevron
                            :class="{ currentsection: currentUrl.indexOf('/settings/rules') === 0 }">
                <f7-icon slot="media" f7="wand_stars" color="gray" />
              </f7-list-item>
              <f7-list-item v-if="$store.getters.apiEndpoint('rules')" link="/settings/scenes/" title="Scenes" view=".view-main" panel-close :animate="false" no-chevron
                            :class="{ currentsection: currentUrl.indexOf('/settings/scenes') === 0 }">
                <f7-icon slot="media" f7="film" color="gray" />
              </f7-list-item>
              <f7-list-item v-if="$store.getters.apiEndpoint('rules')" link="/settings/scripts/" title="Scripts" view=".view-main" panel-close :animate="false" no-chevron
                            :class="{ currentsection: currentUrl.indexOf('/settings/scripts') === 0 }">
                <f7-icon slot="media" f7="doc_plaintext" color="gray" />
              </f7-list-item>
              <f7-list-item v-if="$store.getters.apiEndpoint('rules')" link="/settings/schedule/" title="Schedule" view=".view-main" panel-close :animate="false" no-chevron
                            :class="{ currentsection: currentUrl.indexOf('/settings/schedule') === 0 }">
                <f7-icon slot="media" f7="calendar" color="gray" />
              </f7-list-item>
            </ul>
          </li>

          <!-- Add-on Store -->
          <f7-list-item link="/addons/" :title="$t('sidebar.addOnStore')" view=".view-main" panel-close :animate="false"
                        :class="{ currentsection: currentUrl === '/addons/' }">
            <f7-icon slot="media" ios="f7:bag_fill" aurora="f7:bag_fill" md="material:shopping_bag" color="gray" />
          </f7-list-item>
          <li v-if="showAddonsSubmenu && $store.getters.apiEndpoint('addons')">
            <ul class="menu-sublinks">
              <f7-list-item v-for="section in Object.keys(AddonTitles)" :key="section" :link="`/addons/${section}/`"
                            :title="AddonTitles[section]" view=".view-main" panel-close :animate="false" no-chevron
                            :class="{ currentsection: currentUrl.indexOf(`/addons/${section}`) === 0 }">
                <f7-icon slot="media" :f7="AddonIcons[section]" color="gray" />
              </f7-list-item>
            </ul>
          </li>

          <!-- Developer Tools -->
          <f7-list-item link="/developer/" :title="$t('sidebar.developerTools')" panel-close :animate="false"
                        :class="{ currentsection: currentUrl.indexOf('/developer/') === 0 && currentUrl.indexOf('/developer/widgets') < 0 &&
                          currentUrl.indexOf('/developer/blocks') < 0 && currentUrl.indexOf('/developer/api-explorer') < 0 && currentUrl.indexOf('/developer/log-viewer') < 0 }">
            <f7-icon slot="media" ios="f7:wrench_fill" aurora="f7:wrench_fill" md="material:construction" color="gray" />
          </f7-list-item>
          <li v-if="showDeveloperSubmenu">
            <ul class="menu-sublinks">
              <f7-list-item v-if="$store.getters.apiEndpoint('ui')" link="/developer/widgets/" title="Widgets" view=".view-main" panel-close :animate="false" no-chevron
                            :class="{ currentsection: currentUrl.indexOf('/developer/widgets') === 0 }">
                <f7-icon slot="media" f7="rectangle_on_rectangle_angled" color="gray" />
              </f7-list-item>
              <f7-list-item v-if="$store.getters.apiEndpoint('ui')" link="/developer/blocks/" title="Block Libraries" view=".view-main" panel-close :animate="false" no-chevron
                            :class="{ currentsection: currentUrl.indexOf('/developer/blocks') === 0 }">
                <f7-icon slot="media" f7="ticket" color="gray" />
              </f7-list-item>
              <f7-list-item link="/developer/api-explorer" title="API Explorer" view=".view-main" panel-close :animate="false" no-chevron
                            :class="{ currentsection: currentUrl.indexOf('/developer/api-explorer') === 0 }">
                <f7-icon slot="media" f7="burn" color="gray" />
              </f7-list-item>
              <f7-list-item link="/developer/log-viewer" title="Log Viewer" view=".view-main" panel-close :animate="false" no-chevron
                            :class="{ currentsection: currentUrl.indexOf('/developer/log-viewer') === 0 }">
                <f7-icon slot="media" f7="square_list" color="gray" />
              </f7-list-item>
              <!-- <f7-list-item link="" @click="$f7.emit('toggleDeveloperDock')" title="Dock" view=".view-main" panel-close :animate="false" no-chevron>
                <f7-icon slot="media" :f7="$store.state.developerDock ? 'wrench_fill' : 'wrench'" color="gray" />
              </f7-list-item> -->
            </ul>
          </li>
        </f7-list>

        <f7-list class="admin-links">
          <f7-list-item link="/about/" :title="$t('sidebar.helpAbout')" view=".view-main" panel-close
                        :class="{ currentsection: currentUrl.indexOf('/about') >= 0 }">
            <f7-icon slot="media" ios="f7:question_circle_fill" aurora="f7:question_circle_fill" md="material:help" color="gray" />
          </f7-list-item>
        </f7-list>
        <f7-link class="breakpoint-pin" @click="toggleVisibleBreakpoint">
          <f7-icon slot="media" size="14" :f7="this.visibleBreakpointDisabled ? 'pin_slash' : 'pin'" color="gray" />
        </f7-link>

        <div slot="fixed" class="account" v-if="ready && this.$store.getters.apiEndpoint('auth')">
          <div class="display-flex justify-content-center">
            <div class="hint-signin" v-if="!$store.getters.user && !$store.getters.pages.filter((p) => p.uid !== 'overview').length">
              <em>{{ $t('sidebar.tip.signIn') }}<br><f7-icon f7="arrow_down" size="20" /></em>
            </div>
            <f7-button v-if="!loggedIn" large color="gray" icon-size="36" :tooltip="$t('sidebar.unlockAdmin')" icon-f7="lock_shield_fill" @click="authorize()" />
          </div>
          <f7-list v-if="$store.getters.user" media-list>
            <f7-list-item :title="$store.getters.user.name" :footer="serverDisplayUrl" io="f7:person_alt_circle_fill" link="/profile/" no-chevron panel-close view=".view-main"
                          :class="{ currentsection: currentUrl.indexOf('/profile') >= 0 }">
              <f7-icon slot="media" size="36" ios="f7:person_alt_circle_fill" aurora="f7:person_alt_circle_fill" md="f7:person_alt_circle_fill" color="gray" />
            </f7-list-item>
          </f7-list>
        </div>
      </f7-page>
    </f7-panel>

    <!-- Right Panel -->
    <f7-panel right reveal theme-dark v-if="ready">
      <panel-right />
    <!-- <f7-view url="/panel-right/"></f7-view> -->
    </f7-panel>

    <f7-panel v-if="showDeveloperDock" right :visible-breakpoint="1280" resizable>
      <developer-dock :dock="activeDock" :helpTab="activeHelpTab" :toolTab="activeToolTab" :searchFor="developerSearch" />
    </f7-panel>

    <f7-block v-if="!ready && communicationFailureMsg" class="block-narrow">
      <empty-state-placeholder icon="wifi_slash" :title="$t('error.notReachable.title')" :text="$t('error.notReachable.msg') + '<br/><br/>Error: ' + communicationFailureMsg" />
      <f7-col>
        <f7-list>
          <f7-list-button color="blue" @click="loadData">
            {{ $t('dialogs.retry') }}
          </f7-list-button>
          <f7-list-button color="blue" @click="reload">
            {{ $t('about.reload.reloadApp') }}
          </f7-list-button>
          <f7-list-button v-if="showCachePurgeOption" color="red" @click="purgeServiceWorkerAndCaches">
            {{ $t('about.reload.purgeCachesAndRefresh') }}
          </f7-list-button>
        </f7-list>
      </f7-col>
    </f7-block>

    <f7-view main v-show="ready" class="safe-areas" url="/" :master-detail-breakpoint="960" :animate="themeOptions.pageTransitionAnimation !== 'disabled'" />
  </f7-app>
</template>

<style lang="stylus">
.panel-left::-webkit-scrollbar /* WebKit */
  width 0
  height 0

.panel-left
  scrollbar-width none /* Firefox */
  -ms-overflow-style none  /* IE 10+ */

  .block-title
    margin-left var(--f7-block-padding-horizontal)

  .page
    background #f5f5f5 !important
    padding-bottom calc(var(--f7-tabbar-labels-height) + var(--f7-safe-area-bottom))
    padding-left var(--f7-safe-area-left)
    width calc(var(--f7-panel-width) + var(--f7-safe-area-left))
  .openhab-logo
    margin-top var(--f7-safe-area-top)
    .logo-inner
      background-color #fff
      padding 2.25rem 2rem
  .list
    margin-top 0
    .item-link
      .item-content
        padding-left var(--f7-list-item-padding-horizontal)
      .item-inner
        padding-right var(--f7-list-chevron-icon-area) !important
      .item-inner:before // chevron
        right var(--f7-list-item-padding-horizontal)
  .currentsection
    background-color var(--f7-color-blue-tint)
    color var(--f7-color-white)
    --f7-list-chevron-icon-color var(--f7-color-white)
    .icon
      color var(--f7-color-white) !important
  .account
    z-index 300
    height calc(var(--f7-tabbar-labels-height) + var(--f7-safe-area-bottom))
    background #f5f5f5 !important
    position fixed
    bottom 0
    width 100%
    .hint-signin
      position absolute
      bottom calc(var(--f7-tabbar-labels-height) + var(--f7-safe-area-bottom))
      width 50%
      text-align center
    .list
      position absolute
      bottom 0
      left 0
      width 100%
      margin-bottom 0
      height calc(var(--f7-tabbar-labels-height) + var(--f7-safe-area-bottom))
  .breakpoint-pin
    position fixed
    top calc(var(--f7-safe-area-top))
    right 0
    margin 12px 10px
    opacity 0
  @media (min-width 960px)
    .breakpoint-pin
      opacity 0.75

.theme-dark
  .panel-left
    .page
      background #232323 !important
    .account
      background #232323 !important
    .currentsection
      background-color var(--f7-color-blue-shade)
  .openhab-logo
    .logo-inner
      background #111111 !important

.menu-sublinks
  color var(--f7-list-item-footer-text-color)
  padding-left 0
  margin-bottom var(--f7-list-margin-vertical)
  background-color red
  // --f7-list-item-media-margin 24px
  // --f7-list-item-padding-horizontal 32px
  // --f7-list-chevron-icon-color var(--f7-color-blue-tint) !important

</style>

<script>
import Framework7 from 'framework7/framework7-lite.esm.bundle.js'

import buildInfo from '@/assets/build-info'

import routes from '@/js/routes.js'
import PanelRight from '@/pages/panel-right.vue'
import EmptyStatePlaceholder from '@/components/empty-state-placeholder.vue'

import { loadLocaleMessages } from '@/js/i18n'

import auth from './auth-mixin'
import i18n from './i18n-mixin'
import connectionHealth from './connection-health-mixin'
import sseEvents from './sse-events-mixin'

import dayjs from 'dayjs'
import dayjsLocales from 'dayjs/locale.json'

import { AddonIcons, AddonTitles } from '@/assets/addon-store'

export default {
  mixins: [auth, i18n, connectionHealth, sseEvents],
  components: {
    EmptyStatePlaceholder,
    PanelRight,
    DeveloperDock: () => import(/* webpackChunkName: "admin-base" */ '@/components/developer/developer-dock.vue')
  },
  data () {
    let theme = localStorage.getItem('openhab.ui:theme')

    if ((!theme || theme === 'auto') && window.OHApp && window.OHApp.preferTheme) {
      theme = window.OHApp.preferTheme()
    }

    // choose Aurora as default theme for desktops
    if ((!theme || theme === 'auto') && this.$device.desktop) {
      theme = 'aurora'
    }

    return {
      init: false,
      ready: false,

      // Framework7 Parameters
      f7params: {
        id: 'org.openhab.ui', // App bundle ID
        name: 'openHAB', // App name
        version: buildInfo.version, // App version
        theme: theme || 'auto',
        // theme: (document.documentURI && document.documentURI.indexOf('?theme=ios') > 0) ? 'ios'
        //   : (document.documentURI && document.documentURI.indexOf('?theme=md') > 0) ? 'md'
        //     : 'auto', // Automatic theme detection
        autoDarkTheme: !(localStorage.getItem('openhab.ui:theme.dark')),
        // App root data
        data () {
          return {
          }
        },

        // App routes
        routes,
        view: {
          // disable f7 swipeback on iOS because it's handled natively by Safari
          iosSwipeBack: !this.$device.ios,
          auroraSwipeBack: !this.$device.ios,
          pushState: true,
          pushStateSeparator: ''
        },
        // Enable panel left visibility breakpoint
        panel: {
          leftBreakpoint: 960,
          rightBreakpoint: 1280
        },

        // Register service worker
        serviceWorker: (location.hostname === 'localhost') ? {} : {
          path: './service-worker.js'
        },
        card: {
          swipeToClose: true
        },
        statusbar: {
          overlay: 'auto',
          iosOverlaysWebView: true,
          androidOverlaysWebView: false
        },
        touch: {
          tapHold: true
        },
        // Lazy loading settings
        lazy: {
          threshold: 50,
          sequential: false
        }

        // smartSelect: {
        //   routableModals: !this.$device.firefox && !this.$device.edge
        // },
        // colorPickers: {
        //   routableModals: !this.$device.firefox && !this.$device.edge
        // }
      },

      user: null,

      pages: null,
      showSidebar: true,
      visibleBreakpointDisabled: false,
      loggedIn: false,

      themeOptions: {
        dark: false,
        filled: true
      },

      showSettingsSubmenu: false,
      showAddonsSubmenu: false,
      showDeveloperSubmenu: false,
      showDeveloperDock: false,
      activeDock: 'tools',
      activeToolTab: 'pin',
      activeHelpTab: 'current',
      developerSearch: null,
      currentUrl: ''
    }
  },
  i18n: {
    messages: loadLocaleMessages(require.context('@/assets/i18n/about'))
  },
  computed: {
    serverDisplayUrl () {
      return window.location.origin
    }
  },
  watch: {
    '$store.state.states.sseConnected': {
      handler: function (connected) {
        console.debug('sseConnected', connected)
        if (window.OHApp && typeof window.OHApp.sseConnected === 'function') {
          try {
            window.OHApp.sseConnected(connected)
          } catch {}
        }
      },
      immediate: true // provides initial (not changed yet) state
    }
  },
  methods: {
    loadData (useCredentials) {
      const useCredentialsPromise = (useCredentials) ? this.setBasicCredentials() : Promise.resolve()
      return useCredentialsPromise
        .then(() => { return Framework7.request.promise.json('/rest/') })
        .catch((err) => {
          console.error('openHAB REST API connection failed with error:')
          console.info(err)
          if (err.message === 'Unauthorized' || err.status === 401) {
            if (!useCredentials) {
              // try again with credentials
              this.loadData(true)
              return Promise.reject()
            }
            this.$nextTick(() => {
              this.$f7.dialog.login(
                window.location.host,
                'openHAB',
                (username, password) => {
                  this.setBasicCredentials(username, password)
                  this.$oh.api.get('/rest/').then((rootResponse) => {
                    this.storeBasicCredentials()
                    this.loadData()
                  }).catch((err) => {
                    if (err === 'Unauthorized' || err === 401) {
                      this.clearBasicCredentials()
                      this.loadData()
                      return Promise.reject()
                    }
                  })
                },
                () => {
                  return Promise.reject()
                }
              )
            })
            return Promise.reject()
          // Redirection handling (e.g. when using auth_request in nginx)
          } else if (err.message === 'Found' || err.status === 302) {
            // technically correct way, but unreliable because XhrHttpRequest follows the redirect itself and fails because of CORS policy
            if (err.xhr.HEADERS_RECEIVED > 0) {
              const headersObj = {}
              err.xhr.getAllResponseHeaders().trim().split(/[\r\n]+/).forEach((line) => {
                const parts = line.split(':\t')
                headersObj[parts[0]] = parts[1]
              })
              // Redirect according to location header but modify URL arguments to redirect back to the UI and not the REST API after authentication
              window.location.replace(headersObj['location'].replace(window.location.href + 'rest', window.location.href))
            }
          } else if (err.message === 0 || err.status === 0) {
            // XhrHttpRequest has message & status 0 if the redirected request failed due to CORS policy
            // Follow the authentication redirect by unloading service-worker and reloading PWA
            if ('serviceWorker' in window.navigator) {
              window.navigator.serviceWorker.getRegistration().then((reg) => {
                reg.unregister().then(() => {
                  console.info('Unregistered service-worker, reloading now.')
                  window.location.reload()
                })
              })
            }
          } else {
            // Make sure this is set to a value, otherwise the page won't show up
            this.communicationFailureMsg = err.message || err.status || 'Unknown Error'
            return Promise.reject('openHAB REST API connection failed with error: ' + err.message || err.status)
          }
        })
        .then((res) => res.data)
        .then((rootResponse) => {
          // store the REST API services present on the system
          this.$store.dispatch('loadRootResource', { rootResponse })
          this.updateLocale()
          if (!this.$store.getters.apiEndpoint('auth')) this.$store.commit('setNoAuth', true)
          return rootResponse
        }).then((rootResponse) => {
          const locale = this.$store.getters.locale.toLocaleLowerCase()
          let dayjsLocalePromise = Promise.resolve(null)
          // try to resolve the dayjs file to load if it exists
          if (locale) {
            const dayjsLocale = dayjsLocales.find((l) => l.key === locale || l.key === locale.split('-')[0])
            dayjsLocalePromise = (dayjsLocale) ? import('dayjs/locale/' + dayjsLocale.key + '.js').then(() => Promise.resolve(dayjsLocale)) : Promise.resolve(null)
          }
          // load the pages & widgets, only if the 'ui' endpoint exists (or empty arrays otherwise)
          // load the semantic tags
          return Promise.all([
            ...this.$store.getters.apiEndpoint('ui')
              ? [this.$oh.api.get('/rest/ui/components/ui:page'), this.$oh.api.get('/rest/ui/components/ui:widget')]
              : [Promise.resolve([]), Promise.resolve([])],
            dayjsLocalePromise,
            this.$store.dispatch('loadSemantics')
          ])
        }).then((data) => {
          // store the pages & widgets
          this.$store.commit('setPages', { pages: data[0] })
          this.$store.commit('setWidgets', { widgets: data[1] })
          this.pages = data[0].filter((p) => p.config.sidebar && this.pageIsVisible(p))
            .sort((p1, p2) => {
              const order1 = p1.config.order || 1000
              const order2 = p2.config.order || 1000
              return order1 - order2
            })

          if (data[2]) dayjs.locale(data[2].key)

          // load & build the semantic model
          return this.$store.dispatch('loadSemanticModel')
        }).then(() => {
          // finished with loading
          this.ready = true
          return Promise.resolve()
        })
    },
    pageIsVisible (page) {
      if (!page.config.visibleTo) return true
      if (this.$store.getters.noAuth) return true
      const user = this.$store.getters.user
      if (!user) return false
      if (user.roles && user.roles.some(r => page.config.visibleTo.indexOf('role:' + r) >= 0)) return true
      if (page.config.visibleTo.indexOf('user:' + user.name) >= 0) return true
      return false
    },
    pageIcon (page) {
      if (page.config && page.config.icon) return page.config.icon
      switch (page.component) {
        case 'oh-layout-page':
          return 'f7:rectangle_grid_2x2'
        case 'oh-tabs-page':
          return 'f7:squares_below_rectangle'
        case 'oh-map-page':
          return 'f7:map'
        case 'oh-plan-page':
          return 'f7:square_stack_3d_up'
        case 'oh-chart-page':
          return 'f7:graph_square'
        default:
          return 'f7:tv'
      }
    },
    updateThemeOptions () {
      this.themeOptions.dark = localStorage.getItem('openhab.ui:theme.dark') || ((window.OHApp && window.OHApp.preferDarkMode) ? window.OHApp.preferDarkMode().toString() : (this.$f7.darkTheme ? 'dark' : 'light'))
      this.themeOptions.bars = localStorage.getItem('openhab.ui:theme.bars') || 'light'
      this.themeOptions.homeNavbar = localStorage.getItem('openhab.ui:theme.home.navbar') || 'default'
      this.themeOptions.homeBackground = localStorage.getItem('openhab.ui:theme.home.background') || 'default'
      this.themeOptions.expandableCardAnimation = localStorage.getItem('openhab.ui:theme.home.cardanimation') || 'default'
      if (this.themeOptions.dark === 'dark') {
        this.$$('html').addClass('theme-dark')
      } else {
        this.$$('html').removeClass('theme-dark')
      }
      if (this.themeOptions.pageTransitionAnimation === 'disabled') {
        this.$$('html').addClass('no-page-transitions')
      }
      if (localStorage.getItem('openhab.ui:panel.visibleBreakpointDisabled') === 'true') {
        this.visibleBreakpointDisabled = true
        this.$nextTick(() => this.$f7.panel.get('left').disableVisibleBreakpoint())
      }
      this.themeOptions.blocklyRenderer = localStorage.getItem('openhab.ui:blockly.renderer')
    },
    toggleDeveloperDock () {
      if (!this.$store.getters.isAdmin) return
      this.showDeveloperDock = !this.showDeveloperDock
      if (this.showDeveloperDock) this.$store.dispatch('startTrackingStates')
      this.$store.commit('setDeveloperDock', this.showDeveloperDock)
    },
    selectDeveloperDock (dockOpts) {
      if (dockOpts) {
        if (dockOpts.dock) this.activeDock = dockOpts.dock
        if (dockOpts.helpTab) this.activeHelpTab = dockOpts.helpTab
        if (dockOpts.toolTab) this.activeToolTab = dockOpts.toolTab
        if (dockOpts.searchFor) this.developerSearch = dockOpts.searchFor
      }
      if (!this.showDeveloperDock) this.toggleDeveloperDock()
    },
    toggleVisibleBreakpoint () {
      this.$f7.panel.get('left').toggleVisibleBreakpoint()
      this.visibleBreakpointDisabled = this.$f7.panel.get('left').visibleBreakpointDisabled
      localStorage.setItem('openhab.ui:panel.visibleBreakpointDisabled', this.visibleBreakpointDisabled)
    },
    keyDown (ev) {
      if (ev.keyCode === 68 && ev.shiftKey && ev.altKey) {
        this.toggleDeveloperDock()
        ev.stopPropagation()
        ev.preventDefault()
      }
    },
    updateUrl (newUrl) {
      this.showSettingsSubmenu = newUrl.indexOf('/settings/') === 0
      this.showAddonsSubmenu = newUrl.indexOf('/addons/') === 0
      this.showDeveloperSubmenu = newUrl.indexOf('/developer/') === 0
      this.currentUrl = newUrl
      this.$store.commit('setPagePath', this.currentUrl)
    }
  },
  created () {
    this.AddonIcons = AddonIcons
    this.AddonTitles = AddonTitles

    // special treatment for this option because it's needed to configure the app initialization
    this.themeOptions.pageTransitionAnimation = localStorage.getItem('openhab.ui:theme.pagetransition') || 'default'

    // load 2-way communication for native wrappers
    if (window.OHApp) {
      // tell the app to go fullscreen (if the OHApp is supported)
      if (typeof window.OHApp.goFullscreen === 'function') {
        try {
          window.OHApp.goFullscreen()
        } catch {}
        // expose external calls
        window.MainUI = {
          handleCommand: this.handleCommand
        }
      }
    }

    const refreshToken = this.getRefreshToken()
    if (refreshToken) {
      this.refreshAccessToken().then(() => {
        this.loggedIn = true
        this.init = true
      }).catch((err) => {
        console.warn('Error while using the stored refresh_token to get a new access_token: ' + err + '. Logging out & cleaning session.')
        this.cleanSession()
        this.init = true
      })
    } else {
      this.init = true
    }
  },
  mounted () {
    this.$f7ready((f7) => {
      this.updateThemeOptions()
      this.$f7.data.themeOptions = this.themeOptions

      if (!this.user) {
        this.tryExchangeAuthorizationCode().then((user) => {
          this.loggedIn = true
          this.loadData()
        }).catch((err) => {
          if (err) {
            this.$f7.dialog.alert('An error occurred while getting authorization: ' + err)
          } else {
            // we're just not signed in
            const refreshToken = this.getRefreshToken()
            this.loadData().then(() => {
              if (!refreshToken && this.$store.getters.apiEndpoint('ui') && (!this.$store.getters.page('overview'))) {
                // as there is no overview page, assume the setup wizard hasn't run yet so launch it right away
                this.authorize(true)
              }
            })
          }
        })
      }

      this.$f7.on('pageBeforeIn', (page) => {
        if (page.route && page.route.url) {
          this.updateUrl(page.route.url)
        }
      })

      // needed by updateCurrentUrl() inside addon-store onTabShow()
      this.$f7.on('routeUrlUpdate', (newRoute, router) => {
        this.updateUrl(newRoute.url)
      })

      this.$f7.on('sidebarRefresh', () => {
        this.loadData()
      })

      this.$f7.on('localeChange', () => {
        this.loadData()
      })

      this.$f7.on('addonChange', () => {
        this.loadData()
      })

      this.$f7.on('darkThemeChange', () => {
        this.updateThemeOptions()
      })

      this.$f7.on('toggleDeveloperDock', () => {
        this.toggleDeveloperDock()
      })

      this.$f7.on('selectDeveloperDock', (opts) => {
        this.selectDeveloperDock(opts)
      })

      this.$f7.on('smartSelectOpened', (smartSelect) => {
        if (smartSelect && smartSelect.searchbar && this.$device.desktop) {
          smartSelect.searchbar.$inputEl.focus()
        }
      })

      if (window) {
        window.addEventListener('keydown', this.keyDown)
      }

      this.startEventSource()
    })
  }
}
</script>
