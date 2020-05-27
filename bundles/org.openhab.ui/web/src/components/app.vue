<template>
<f7-app v-if="init" :params="f7params" :class="{ 'theme-dark': this.themeOptions.dark === 'dark', 'theme-filled': this.themeOptions.bars === 'filled' }">

  <!-- Left Panel -->
  <f7-panel v-show="ready" left :cover="showSidebar" class="sidebar" :visible-breakpoint="1024">
    <f7-page>
      <f7-link href="/" class="logo no-ripple" panel-close v-if="themeOptions.dark === 'dark'">
        <div class="logo-inner"><img src="../res/img/openhab-logo-white.png" width="100%"></div>
      </f7-link>
      <f7-link href="/" class="logo no-ripple" panel-close v-else>
        <div class="logo-inner"><img src="../res/img/openhab-logo.png" width="100%"></div>
      </f7-link>
      <f7-list v-if="ready">
        <f7-list-item v-if="!pages || !pages.length">
          <span><em>No pages</em></span>
        </f7-list-item>
        <!-- <f7-list-item v-for="sitemap in sitemaps" :animate="false" :key="sitemap.name"
                :class="{ currentsection: currentUrl.indexOf('/sitemap/' + sitemap.name) >= 0 }"
                :link="'/sitemap/' + sitemap.name + '/' + sitemap.name"
                :title="sitemap.label" view=".view-main" panel-close>
          <f7-icon slot="media" ios="f7:menu" aurora="f7:menu" md="material:list"></f7-icon>
        </f7-list-item> -->
        <f7-list-item v-for="page in pages" :animate="false" :key="page.uid"
                :class="{ currentsection: currentUrl.indexOf('/page/' + page.uid) >= 0 }"
                :link="'/page/' + page.uid"
                :title="page.config.label" view=".view-main" panel-close>
          <f7-icon slot="media" :f7="pageIcon(page)"></f7-icon>
        </f7-list-item>
      </f7-list>
      <f7-block-title v-if="$store.getters.isAdmin">Administration</f7-block-title>
      <f7-list class="admin-links" v-if="$store.getters.isAdmin">
        <f7-list-item link="/settings/" title="Settings" view=".view-main" panel-close :animate="false"
            :class="{ currentsection: currentUrl === '/settings/' || currentUrl.indexOf('/settings/addons/') >= 0 || currentUrl.indexOf('/settings/services/') >= 0 }">
          <f7-icon slot="media" ios="f7:gear_alt_fill" aurora="f7:gear_alt_fill" md="material:settings" color="gray"></f7-icon>
        </f7-list-item>
        <li v-if="showSettingsSubmenu">
          <ul class="menu-sublinks">
          <f7-list-item link="/settings/things/" title="Things" view=".view-main" panel-close :animate="false" no-chevron
              :class="{ currentsection: currentUrl.indexOf('/settings/things') >= 0 }">
            <f7-icon slot="media" f7="lightbulb" color="gray"></f7-icon>
          </f7-list-item>
          <f7-list-item link="/settings/model/" title="Model" view=".view-main" panel-close :animate="false" no-chevron
              :class="{ currentsection: currentUrl.indexOf('/settings/model') >= 0 }">
            <f7-icon slot="media" f7="list_bullet_indent" color="gray"></f7-icon>
          </f7-list-item>
          <f7-list-item link="/settings/items/" title="Items" view=".view-main" panel-close :animate="false" no-chevron
              :class="{ currentsection: currentUrl.indexOf('/settings/items') >= 0 }">
            <f7-icon slot="media" f7="square_on_circle" color="gray"></f7-icon>
          </f7-list-item>
          <f7-list-item link="/settings/pages/" title="Pages" view=".view-main" panel-close :animate="false" no-chevron
              :class="{ currentsection: currentUrl.indexOf('/settings/pages') >= 0 }">
            <f7-icon slot="media" f7="tv" color="gray"></f7-icon>
          </f7-list-item>
          <f7-list-item link="/settings/rules/" title="Rules" view=".view-main" panel-close :animate="false" no-chevron
              :class="{ currentsection: currentUrl.indexOf('/settings/rules') >= 0 }">
            <f7-icon slot="media" f7="wand_rays" color="gray"></f7-icon>
          </f7-list-item>
          <f7-list-item link="/settings/schedule/" title="Schedule" view=".view-main" panel-close :animate="false" no-chevron
              :class="{ currentsection: currentUrl.indexOf('/settings/schedule') >= 0 }">
            <f7-icon slot="media" f7="calendar" color="gray"></f7-icon>
          </f7-list-item>
          </ul>
        </li>

        <f7-list-item link="/developer/" title="Developer Tools" panel-close
            :class="{ currentsection: currentUrl.indexOf('/developer/') >= 0 && currentUrl.indexOf('/developer/widgets') < 0 }">
          <f7-icon slot="media" ios="f7:exclamationmark_shield_fill" aurora="f7:exclamationmark_shield_fill" md="material:extension" color="gray"></f7-icon>
        </f7-list-item>
        <li v-if="showDeveloperSubmenu">
          <ul class="menu-sublinks">
          <f7-list-item link="/developer/widgets/" title="Widgets" view=".view-main" panel-close :animate="false" no-chevron
              :class="{ currentsection: currentUrl.indexOf('/developer/widgets') >= 0 }">
            <f7-icon slot="media" f7="rectangle_on_rectangle_angled" color="gray"></f7-icon>
          </f7-list-item>
          </ul>
        </li>
      </f7-list>

      <f7-list class="admin-links">
        <f7-list-item link="/about/" title="Help &amp; About" view=".view-main" panel-close
            :class="{ currentsection: currentUrl.indexOf('/about') >= 0 }">
          <f7-icon slot="media" ios="f7:question_circle_fill" aurora="f7:question_circle_fill" md="material:help" color="gray"></f7-icon>
        </f7-list-item>
      </f7-list>

      <div slot="fixed" class="account" v-if="ready">
        <div class="display-flex justify-content-center">
          <div class="hint-signin" v-if="!$store.getters.user && !$store.getters.pages.length">
            <em>Sign in as an administrator to access settings<br /><f7-icon f7="arrow_down" size="20"></f7-icon></em>
          </div>
          <f7-button v-if="!loggedIn" large color="gray" icon-size="36" tooltip="Unlock Administration" icon-f7="lock_shield_fill" @click="authorize()" />
        </div>
        <f7-list v-if="$store.getters.user" media-list>
          <f7-list-item :title="$store.getters.user.name" :footer="serverDisplayUrl" io="f7:person_alt_circle_fill" link="/profile/" no-chevron panel-close view=".view-main"
              :class="{ currentsection: currentUrl.indexOf('/profile') >= 0 }">
            <f7-icon slot="media" size="36" ios="f7:person_alt_circle_fill" aurora="f7:person_alt_circle_fill" md="f7:person_alt_circle_fill" color="gray"></f7-icon>
          </f7-list-item>
        </f7-list>
      </div>
    </f7-page>
  </f7-panel>

  <!-- Right Panel -->
  <f7-panel right reveal theme-dark>
    <panel-right />
    <!-- <f7-view url="/panel-right/"></f7-view> -->
  </f7-panel>

  <f7-view main v-show="ready" class="safe-areas" url="/" :master-detail-breakpoint="960" :animate="themeOptions.pageTransitionAnimation !== 'disabled'"></f7-view>

  <f7-login-screen id="my-login-screen" :opened="loginScreenOpened">
    <f7-view name="login" v-if="$device.cordova">
      <f7-page login-screen>
        <f7-login-screen-title><img width="200px" src="res/img/openhab-logo.png"><br>Login</f7-login-screen-title>
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
  </f7-login-screen>
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
import cordovaApp from '../js/cordova-app.js'
import routes from '../js/routes.js'
import PanelRight from '../pages/panel-right.vue'

import auth from '@/js/openhab/auth.js'

export default {
  mixins: [auth],
  components: {
    PanelRight
  },
  data () {
    let theme = localStorage.getItem('openhab.ui:theme')
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
          pushState: true // !this.$device.cordova
        },
        // Enable panel left visibility breakpoint
        panel: {
          leftBreakpoint: 960
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
      loginScreenOpened: false,
      loggedIn: false,

      themeOptions: {
        dark: false,
        filled: true
      },

      showSettingsSubmenu: false,
      showDeveloperSubmenu: false,
      currentUrl: ''
    }
  },
  computed: {
    isAdmin () {
      return this.ready && this.user && this.user.roles && this.user.roles.indexOf('administrator') >= 0
    },
    serverDisplayUrl () {
      return (this.serverUrl || window.location.origin)
    }
  },
  methods: {
    loadSidebarPages () {
      return Promise.all([
        this.$oh.api.get('/rest/sitemaps'),
        this.$oh.api.get('/rest/ui/components/ui:page'),
        this.$oh.api.get('/rest/ui/components/ui:widget')
      ]).then((data) => {
        this.sitemaps = data[0]
        this.$store.commit('setPages', { pages: data[1] })
        this.$store.commit('setWidgets', { widgets: data[2] })
        this.pages = data[1].filter((p) => p.config.sidebar && this.pageIsVisible(p))
          .sort((p1, p2) => {
            const order1 = p1.config.order || 1000
            const order2 = p2.config.order || 1000
            return order1 - order2
          })

        this.ready = true
      })
    },
    pageIsVisible (page) {
      if (!page.config.visibleTo) return true
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
      this.loadSidebarPages().then((data) => {
        // this.sitemaps = data
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
      this.themeOptions.dark = localStorage.getItem('openhab.ui:theme.dark') || (this.$f7.darkTheme ? 'dark' : 'light')
      this.themeOptions.bars = localStorage.getItem('openhab.ui:theme.bars') || ((this.$theme.ios || this.$f7.darkTheme || this.themeOptions.dark === 'dark') ? 'light' : 'filled')
      this.themeOptions.homeNavbar = localStorage.getItem('openhab.ui:theme.home.navbar') || 'default'
      this.themeOptions.homeBackground = localStorage.getItem('openhab.ui:theme.home.background') || 'default'
      this.themeOptions.expandableCardAnimation = localStorage.getItem('openhab.ui:theme.home.cardanimation') || 'default'
    }
  },
  created () {
    // special treatment for this option because it's needed to configure the app initialization
    this.themeOptions.pageTransitionAnimation = localStorage.getItem('openhab.ui:theme.pagetransition') || 'default'
    // this.loginScreenOpened = true
    const refreshToken = this.getRefreshToken()
    if (refreshToken) {
      this.refreshAccessToken().then((user) => {
        this.loggedIn = true
        this.loadSidebarPages()
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
          this.loadSidebarPages()
        }).catch((err) => {
          if (err) {
            this.$f7.dialog.alert('An error occurred while getting authorization: ' + err)
          } else {
            // we're just not signed in
            this.loadSidebarPages()
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
        this.loadSidebarPages()
      })

      this.$f7.on('darkThemeChange', () => {
        this.updateThemeOptions()
      })
    })
  }
}
</script>
