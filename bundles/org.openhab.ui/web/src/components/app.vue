<template>
  <f7-app v-if="init" :style="{ visibility: (($store.getters.user || $store.getters.page('overview')) || loginScreenOpened) ? '' : 'hidden' }" :params="f7params" :class="{ 'theme-dark': this.themeOptions.dark === 'dark', 'theme-filled': this.themeOptions.bars === 'filled' }">
    <!-- Left Panel -->
    <f7-panel v-show="ready" left :cover="showSidebar" class="sidebar" :visible-breakpoint="1024">
      <f7-page>
        <f7-link href="/" class="logo no-ripple" panel-close v-if="themeOptions.dark === 'dark'">
          <div class="logo-inner">
            <img src="@/images/openhab-logo-white.svg" type="image/svg+xml" width="196px">
          </div>
        </f7-link>
        <f7-link href="/" class="logo no-ripple" panel-close v-else>
          <div class="logo-inner">
            <img src="@/images/openhab-logo.svg" type="image/svg+xml" width="196px">
          </div>
        </f7-link>
        <f7-list v-if="ready">
          <f7-list-item v-if="$store.getters.apiEndpoint('ui') && (!pages || !pages.length)">
            <span><em>{{ $t('sidebar.noPages') }}</em></span>
          </f7-list-item>
          <!-- <f7-list-item v-for="sitemap in sitemaps" :animate="false" :key="sitemap.name"
                :class="{ currentsection: currentUrl.indexOf('/sitemap/' + sitemap.name) >= 0 }"
                :link="'/sitemap/' + sitemap.name + '/' + sitemap.name"
                :title="sitemap.label" view=".view-main" panel-close>
          <f7-icon slot="media" ios="f7:menu" aurora="f7:menu" md="material:list"></f7-icon>
        </f7-list-item> -->
          <f7-list-item v-for="page in pages" :animate="false" :key="page.uid"
                        :class="{ currentsection: currentUrl === '/page/' + page.uid || currentUrl.indexOf('/page/' + page.uid + '/') >= 0 }"
                        :link="'/page/' + page.uid"
                        :title="page.config.label" view=".view-main" panel-close>
            <f7-icon slot="media" :f7="pageIcon(page)" />
          </f7-list-item>
        </f7-list>
        <f7-block-title v-if="$store.getters.isAdmin" v-t="'sidebar.administration'" />
        <f7-list class="admin-links" v-if="$store.getters.isAdmin">
          <f7-list-item link="/settings/" :title="$t('sidebar.settings')" view=".view-main" panel-close :animate="false"
                        :class="{ currentsection: currentUrl === '/settings/' || currentUrl.indexOf('/settings/addons/') >= 0 || currentUrl.indexOf('/settings/services/') >= 0 }">
            <f7-icon slot="media" ios="f7:gear_alt_fill" aurora="f7:gear_alt_fill" md="material:settings" color="gray" />
          </f7-list-item>
          <li v-if="showSettingsSubmenu">
            <ul class="menu-sublinks">
              <f7-list-item v-if="$store.getters.apiEndpoint('things')" link="/settings/things/" title="Things" view=".view-main" panel-close :animate="false" no-chevron
                            :class="{ currentsection: currentUrl.indexOf('/settings/things') >= 0 }">
                <f7-icon slot="media" f7="lightbulb" color="gray" />
              </f7-list-item>
              <f7-list-item v-if="$store.getters.apiEndpoint('items')" link="/settings/model/" title="Model" view=".view-main" panel-close :animate="false" no-chevron
                            :class="{ currentsection: currentUrl.indexOf('/settings/model') >= 0 }">
                <f7-icon slot="media" f7="list_bullet_indent" color="gray" />
              </f7-list-item>
              <f7-list-item v-if="$store.getters.apiEndpoint('items')" link="/settings/items/" title="Items" view=".view-main" panel-close :animate="false" no-chevron
                            :class="{ currentsection: currentUrl.indexOf('/settings/items') >= 0 }">
                <f7-icon slot="media" f7="square_on_circle" color="gray" />
              </f7-list-item>
              <f7-list-item v-if="$store.getters.apiEndpoint('ui')" link="/settings/pages/" title="Pages" view=".view-main" panel-close :animate="false" no-chevron
                            :class="{ currentsection: currentUrl.indexOf('/settings/pages') >= 0 }">
                <f7-icon slot="media" f7="tv" color="gray" />
              </f7-list-item>
              <f7-list-item v-if="$store.getters.apiEndpoint('rules')" link="/settings/rules/" title="Rules" view=".view-main" panel-close :animate="false" no-chevron
                            :class="{ currentsection: currentUrl.indexOf('/settings/rules') >= 0 }">
                <f7-icon slot="media" f7="wand_stars" color="gray" />
              </f7-list-item>
              <f7-list-item v-if="$store.getters.apiEndpoint('rules')" link="/settings/scenes/" title="Scenes" view=".view-main" panel-close :animate="false" no-chevron
                            :class="{ currentsection: currentUrl.indexOf('/settings/scenes') >= 0 }">
                <f7-icon slot="media" f7="film" color="gray" />
              </f7-list-item>
              <f7-list-item v-if="$store.getters.apiEndpoint('rules')" link="/settings/scripts/" title="Scripts" view=".view-main" panel-close :animate="false" no-chevron
                            :class="{ currentsection: currentUrl.indexOf('/settings/scripts') >= 0 }">
                <f7-icon slot="media" f7="doc_plaintext" color="gray" />
              </f7-list-item>
              <f7-list-item v-if="$store.getters.apiEndpoint('rules')" link="/settings/schedule/" title="Schedule" view=".view-main" panel-close :animate="false" no-chevron
                            :class="{ currentsection: currentUrl.indexOf('/settings/schedule') >= 0 }">
                <f7-icon slot="media" f7="calendar" color="gray" />
              </f7-list-item>
            </ul>
          </li>

          <f7-list-item link="/developer/" :title="$t('sidebar.developerTools')" panel-close :animate="false"
                        :class="{ currentsection: currentUrl.indexOf('/developer/') >= 0 && currentUrl.indexOf('/developer/widgets') < 0 &&
                          currentUrl.indexOf('/developer/blocks') < 0 && currentUrl.indexOf('/developer/api-explorer') < 0 }">
            <f7-icon slot="media" ios="f7:exclamationmark_shield_fill" aurora="f7:exclamationmark_shield_fill" md="material:extension" color="gray" />
          </f7-list-item>
          <li v-if="showDeveloperSubmenu">
            <ul class="menu-sublinks">
              <f7-list-item v-if="$store.getters.apiEndpoint('ui')" link="/developer/widgets/" title="Widgets" view=".view-main" panel-close :animate="false" no-chevron
                            :class="{ currentsection: currentUrl.indexOf('/developer/widgets') >= 0 }">
                <f7-icon slot="media" f7="rectangle_on_rectangle_angled" color="gray" />
              </f7-list-item>
              <f7-list-item v-if="$store.getters.apiEndpoint('ui')" link="/developer/blocks/" title="Block Libraries" view=".view-main" panel-close :animate="false" no-chevron
                            :class="{ currentsection: currentUrl.indexOf('/developer/blocks') >= 0 }">
                <f7-icon slot="media" f7="ticket" color="gray" />
              </f7-list-item>
              <f7-list-item link="/developer/api-explorer" title="API Explorer" view=".view-main" panel-close :animate="false" no-chevron
                            :class="{ currentsection: currentUrl.indexOf('/developer/api-explorer') >= 0 }">
                <f7-icon slot="media" f7="burn" color="gray" />
              </f7-list-item>
              <!-- <f7-list-item link="" @click="$f7.emit('toggleDeveloperSidebar')" title="Sidebar" view=".view-main" panel-close :animate="false" no-chevron>
                <f7-icon slot="media" :f7="$store.state.developerSidebar ? 'wrench_fill' : 'wrench'" color="gray" />
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

    <f7-panel v-if="showDeveloperSidebar" right :visible-breakpoint="1280" resizable>
      <developer-sidebar />
    </f7-panel>

    <f7-view main v-show="ready" class="safe-areas" url="/" :master-detail-breakpoint="960" :animate="themeOptions.pageTransitionAnimation !== 'disabled'" />

  <!-- <f7-login-screen id="my-login-screen" :opened="loginScreenOpened">
    <f7-view name="login" v-if="$device.cordova">
      <f7-page login-screen>
        <f7-login-screen-title><img src="@/images/openhab-logo.svg" type="image/svg+xml" width="200px"><br>Login</f7-login-screen-title>
        <f7-list form>
          <f7-list-input
            type="text"
            name="serverUrl"
            placeholder="openHAB server URL"
            :value="serverUrl"
            @input="serverUrl = $event.target.value"
          ></f7-list-input>
          <f7-list-input
            type="text"
            name="username"
            placeholder="Username (optional)"
            :value="username"
            @input="username = $event.target.value"
          ></f7-list-input>
          <f7-list-input
            type="password"
            name="password"
            placeholder="Password (optional)"
            :value="password"
            @input="password = $event.target.value"
          ></f7-list-input>
        </f7-list>
        <f7-list>
          <f7-list-button title="Sign In" @click="login"></f7-list-button>
          <f7-block-footer>
            Some text about login information.
          </f7-block-footer>
        </f7-list>
      </f7-page>
    </f7-view>
  </f7-login-screen> -->
  </f7-app>
</template>

<style lang="stylus" scoped>
.panel-left::-webkit-scrollbar /* WebKit */
  width 0
  height 0

.panel-left
  scrollbar-width none /* Firefox */
  -ms-overflow-style none  /* IE 10+ */

  .page
    background #f5f5f5 !important
    padding-bottom calc(var(--f7-tabbar-labels-height) + var(--f7-safe-area-bottom))
  .logo
    margin-top var(--f7-safe-area-top)
    .logo-inner
      background-color #fff
      padding 2.25rem 2rem
  .list
    margin-top 0
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
    bottom calc(var(--f7-safe-area-bottom))
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
  .logo
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

import cordovaApp from '../js/cordova-app.js'
import routes from '../js/routes.js'
import PanelRight from '../pages/panel-right.vue'
import DeveloperSidebar from './developer/developer-sidebar.vue'

import auth from './auth-mixin.js'
import i18n from './i18n-mixin.js'

import dayjs from 'dayjs'
import dayjsLocales from 'dayjs/locale.json'

export default {
  mixins: [auth, i18n],
  components: {
    PanelRight,
    DeveloperSidebar
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
      eventSource: null,
      audioContext: null,

      // Framework7 Parameters
      f7params: {
        id: 'org.openhab.ui', // App bundle ID
        name: 'openHAB', // App name
        version: '3.0.0', // App version, TODO retrieve from the server (with the build information)
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
        routes: routes,
        view: {
          // disable f7 swipeback on iOS (if not in cordova) because it's handled natively by Safari
          iosSwipeBack: !this.$device.ios || this.$device.cordova,
          auroraSwipeBack: !this.$device.ios || this.$device.cordova,
          pushState: true, // !this.$device.cordova
          pushStateSeparator: ''
        },
        // Enable panel left visibility breakpoint
        panel: {
          leftBreakpoint: 960,
          rightBreakpoint: 1280
        },

        // Register service worker
        serviceWorker: (this.$device.cordova || location.hostname === 'localhost') ? {} : {
          path: '/service-worker.js'
        },
        // Input settings
        input: {
          scrollIntoViewOnFocus: !!this.$device.cordova,
          scrollIntoViewCentered: !!this.$device.cordova
        },
        card: {
          swipeToClose: true
        },
        // Cordova Statusbar settings
        statusbar: {
          overlay: (this.$device.cordova && this.$device.ios) || 'auto',
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

      // Login screen data
      serverUrl: '',
      username: '',
      password: '',

      user: null,

      sitemaps: null,
      pages: null,
      showSidebar: true,
      visibleBreakpointDisabled: false,
      loginScreenOpened: false,
      loggedIn: false,

      themeOptions: {
        dark: false,
        filled: true
      },

      showSettingsSubmenu: false,
      showDeveloperSubmenu: false,
      showDeveloperSidebar: false,
      currentUrl: '',

      communicationFailureToast: null
    }
  },
  computed: {
    isAdmin () {
      if (!this.$store.getters.apiEndpoint('auth')) return true
      return this.ready && this.user && this.user.roles && this.user.roles.indexOf('administrator') >= 0
    },
    serverDisplayUrl () {
      return (this.serverUrl || window.location.origin)
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
            this.loginScreenOpened = true
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
            this.$f7.dialog.alert('openHAB REST API connection failed with error ' + err.message || err.status)
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
      switch (page.component) {
        case 'Sitemap':
          return 'menu'
        case 'oh-layout-page':
          return 'rectangle_grid_2x2'
        case 'oh-tabs-page':
          return 'squares_below_rectangle'
        case 'oh-map-page':
          return 'map'
        case 'oh-plan-page':
          return 'square_stack_3d_up'
        case 'oh-chart-page':
          return 'graph_square'
        default:
          return 'tv'
      }
    },
    login () {
      localStorage.setItem('openhab.ui:serverUrl', this.serverUrl)
      localStorage.setItem('openhab.ui:username', this.username)
      localStorage.setItem('openhab.ui:password', this.password)
      this.loadData().then(() => {
        this.loginScreenOpened = false
        this.loggedIn = true
      }).catch((err) => {
        localStorage.removeItem('openhab.ui:serverUrl')
        localStorage.removeItem('openhab.ui:username')
        localStorage.removeItem('openhab.ui:password')
        this.$f7.dialog.alert('Cannot login, please try again: ' + err)
      })
    },
    logout () {
      this.$f7.preloader.show()
      this.ready = false
      localStorage.removeItem('openhab.ui:serverUrl')
      localStorage.removeItem('openhab.ui:username')
      localStorage.removeItem('openhab.ui:password')
      this.user = null
      this.serverUrl = ''
      this.username = ''
      this.password = ''
      this.cleanSession().then(() => {
        this.loggedIn = false
        this.$f7.views.main.router.navigate('/', { animate: false, clearPreviousHistory: true })
        window.location = window.location.origin
        if (this.$device.cordova) {
          this.loginScreenOpened = true
        }
      }).catch((err) => {
        this.$f7.preloader.hide()
        this.$f7.dialog.alert('Error while signing out: ' + err)
      })
    },
    updateThemeOptions () {
      this.themeOptions.dark = localStorage.getItem('openhab.ui:theme.dark') || ((window.OHApp && window.OHApp.preferDarkMode) ? window.OHApp.preferDarkMode().toString() : (this.$f7.darkTheme ? 'dark' : 'light'))
      this.themeOptions.bars = localStorage.getItem('openhab.ui:theme.bars') || ((this.$theme.ios || this.$f7.darkTheme || this.themeOptions.dark === 'dark') ? 'light' : 'filled')
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
    },
    toggleDeveloperSidebar () {
      if (!this.$store.getters.isAdmin) return
      this.showDeveloperSidebar = !this.showDeveloperSidebar
      if (this.showDeveloperSidebar) this.$store.dispatch('startTrackingStates')
      this.$store.commit('setDeveloperSidebar', this.showDeveloperSidebar)
    },
    toggleVisibleBreakpoint () {
      this.$f7.panel.get('left').toggleVisibleBreakpoint()
      this.visibleBreakpointDisabled = this.$f7.panel.get('left').visibleBreakpointDisabled
      localStorage.setItem('openhab.ui:panel.visibleBreakpointDisabled', this.visibleBreakpointDisabled)
    },
    keyDown (ev) {
      if (ev.keyCode === 68 && ev.shiftKey && ev.altKey) {
        this.toggleDeveloperSidebar()
        ev.stopPropagation()
        ev.preventDefault()
      }
    },
    startEventSource () {
      this.eventSource = this.$oh.sse.connect('/rest/events?topics=openhab/webaudio/playurl', null, (event) => {
        const topicParts = event.topic.split('/')
        switch (topicParts[2]) {
          case 'playurl':
            this.playAudioUrl(JSON.parse(event.payload))
            break
        }
      })
    },
    stopEventSource () {
      this.$oh.sse.close(this.eventSource)
      this.eventSource = null
    },
    playAudioUrl (audioUrl) {
      try {
        if (!this.audioContext) {
          window.AudioContext = window.AudioContext || window.webkitAudioContext
          if (typeof (window.AudioContext) !== 'undefined') {
            this.audioContext = new AudioContext()
            unlockAudioContext(this.audioContext)
          }
        }
        console.log('Playing audio URL: ' + audioUrl)
        this.$oh.api.getPlain(audioUrl, '', '*/*', 'arraybuffer').then((data) => {
          this.audioContext.decodeAudioData(data, (buffer) => {
            let source = this.audioContext.createBufferSource()
            source.buffer = buffer
            source.connect(this.audioContext.destination)
            source.start(0)
          })
        })
      } catch (e) {
        console.warn('Error while playing audio URL: ' + e.toString())
      }
      // Safari requires a touch event after the stream has started, hence this workaround
      // Credit: https://www.mattmontag.com/web/unlock-web-audio-in-safari-for-ios-and-macos
      function unlockAudioContext (audioContext) {
        if (audioContext.state !== 'suspended') return
        const b = document.body
        const events = ['touchstart', 'touchend', 'mousedown', 'keydown']
        events.forEach(e => b.addEventListener(e, unlock, false))
        function unlock () { audioContext.resume().then(clean) }
        function clean () { events.forEach(e => b.removeEventListener(e, unlock)) }
      }
    },
    /**
     * Creates and opens a toast message that indicates a failure, e.g. of SSE connection
     * @param {string} message message to show
     * @param {boolean} [reloadButton=false] displays a reload button
     * @param {boolean} [autoClose=true] closes toast automatically
     * @returns {Toast.Toast}
     */
    displayFailureToast (message, reloadButton = false, autoClose = true) {
      const toast = this.$f7.toast.create({
        text: message,
        closeButton: reloadButton,
        closeButtonText: this.$t('dialogs.reload'),
        destroyOnClose: autoClose,
        closeTimeout: (autoClose) ? 5000 : undefined,
        cssClass: 'failure-toast button-outline',
        position: 'bottom',
        horizontalPosition: 'center'
      })
      toast.on('closeButtonClick', () => {
        window.location.reload()
      })
      toast.open()
      return toast
    }
  },
  created () {
    // special treatment for this option because it's needed to configure the app initialization
    this.themeOptions.pageTransitionAnimation = localStorage.getItem('openhab.ui:theme.pagetransition') || 'default'
    // tell the app to go fullscreen (if the OHApp is supported)
    if (window.OHApp && typeof window.OHApp.goFullscreen === 'function') {
      try {
        window.OHApp.goFullscreen()
      } catch {}
    }
    // this.loginScreenOpened = true
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

      // Init cordova APIs (see cordova-app.js)
      if (f7.device.cordova) {
        cordovaApp.init(f7)

        if (!localStorage.getItem('openhab.ui:serverUrl')) {
          this.loginScreenOpened = true
          return
        }

        this.loggedIn = true
      }

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
          this.showSettingsSubmenu = page.route.url.indexOf('/settings/') === 0
          this.showDeveloperSubmenu = page.route.url.indexOf('/developer/') === 0
          this.currentUrl = page.route.url
        }
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

      this.$f7.on('toggleDeveloperSidebar', () => {
        this.toggleDeveloperSidebar()
      })

      this.$f7.on('smartSelectOpened', (smartSelect) => {
        if (smartSelect && smartSelect.searchbar && this.$device.desktop) {
          smartSelect.searchbar.$inputEl.focus()
        }
      })

      this.$store.subscribe((mutation, state) => {
        if (mutation.type === 'sseConnected') {
          if (!window.OHApp && this.$f7) {
            if (mutation.payload === false) {
              if (this.communicationFailureToast === null) this.communicationFailureToast = this.displayFailureToast(this.$t('error.communicationFailure'), true, false)
              this.communicationFailureToast.open()
            } else if (mutation.payload === true) {
              if (this.communicationFailureToast !== null) {
                this.communicationFailureToast.close()
                this.communicationFailureToast.destroy()
                this.communicationFailureToast = null
              }
            }
          }
        }
      })

      this.$store.subscribeAction({
        error: (action, state, error) => {
          if (action.type === 'sendCommand') {
            let reloadButton = true
            let msg = this.$t('error.communicationFailure')
            switch (error) {
              case 404:
              case 'Not Found':
                msg = this.$t('error.itemNotFound').replace('%s', action.payload.itemName)
                reloadButton = false
                return this.displayFailureToast(msg, reloadButton)
            }
            if (this.communicationFailureToast === null) {
              this.communicationFailureToast = this.displayFailureToast(this.$t('error.communicationFailure'), true, true)
              this.communicationFailureToast.on('closed', () => {
                this.communicationFailureToast = null
              })
            }
          }
        }
      })

      if (window) {
        window.addEventListener('keydown', this.keyDown)
      }

      if (localStorage.getItem('openhab.ui:webaudio.enable') === 'enabled') {
        this.startEventSource()
      }
    })
  }
}
</script>
