<template>
<f7-app :params="f7params" :class="{ 'theme-dark': this.themeOptions.dark === 'dark', 'theme-filled': this.themeOptions.bars === 'filled', 'no-page-transitions': this.themeOptions.pageTransitionAnimation === 'disabled' }">

  <!-- Left Panel -->
  <f7-panel left :cover="showSidebar" class="sidebar" :visible-breakpoint="1024">
    <f7-page>
      <f7-list-item link="/" class="logo" panel-close v-if="themeOptions.dark === 'dark'">
        <img src="../res/img/openhab-logo-white.png" width="100%">
      </f7-list-item>
      <f7-list-item link="/" class="logo" panel-close v-else>
        <img src="../res/img/openhab-logo.png" width="100%">
      </f7-list-item>
      <!-- <f7-block-title>Sitemaps</f7-block-title> -->
      <f7-list>
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
      <f7-block-title>Administration</f7-block-title>
      <f7-list class="admin-links">
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

        <f7-list-item link="/about/" title="Help &amp; About" view=".view-main" panel-close
            :class="{ currentsection: currentUrl.indexOf('/about') >= 0 }">
          <f7-icon slot="media" ios="f7:question_circle_fill" aurora="f7:question_circle_fill" md="material:help" color="gray"></f7-icon>
        </f7-list-item>
        <f7-list-item v-if="loggedIn" link="/" title="Logout" @click="logout()" panel-close>
          <f7-icon slot="media" ios="f7:square_arrow_right" md="material:exit_to_app" color="gray"></f7-icon>
        </f7-list-item>
        <!-- <f7-list-item title="Master-Details" view=".view-main" panel-close>
          <f7-icon slot="media" ios="f7:exit" md="material:exit_to_app"></f7-icon>
        </f7-list-item> -->
      </f7-list>
    </f7-page>
  </f7-panel>

  <!-- Right Panel -->
  <f7-panel right reveal theme-dark>
    <panel-right />
    <!-- <f7-view url="/panel-right/"></f7-view> -->
  </f7-panel>

  <!-- Your main view, should have "view-main" class -->
  <f7-view main class="safe-areas" url="/" :master-detail-breakpoint="960" @routeChanged="console.log('hello')"></f7-view>

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
.panel-left
  .page
    background #f5f5f5 !important
  .logo
    margin-top var(--f7-safe-area-top)
    list-style none
    padding 2.5rem 2rem
    background-color #fff
    height 50px
  .list
    margin-top 0
  .currentsection
    background-color var(--f7-color-blue-tint)
    color var(--f7-color-white)
    --f7-list-chevron-icon-color var(--f7-color-white)
    .icon
      color var(--f7-color-white) !important

.theme-dark
  .panel-left
    .page
      background #232323 !important
    .currentsection
      background-color var(--f7-color-blue-shade)
  .logo
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

export default {
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
      // Framework7 Parameters
      f7params: {
        id: 'org.openhab.ui', // App bundle ID
        name: 'openHAB', // App name
        version: '3.0.0', // App version, TODO retrieve from the server (with the build information)
        theme: theme || 'auto',
        // theme: (document.documentURI && document.documentURI.indexOf('?theme=ios') > 0) ? 'ios'
        //   : (document.documentURI && document.documentURI.indexOf('?theme=md') > 0) ? 'md'
        //     : 'auto', // Automatic theme detection
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
        this.pages = data[1].filter((p) => p.config.sidebar)
          .sort((p1, p2) => {
            const order1 = p1.config.order || 1000
            const order2 = p2.config.order || 1000
            return order1 - order2
          })
      })
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
      localStorage.removeItem('openhab.ui:serverUrl')
      localStorage.removeItem('openhab.ui:username')
      localStorage.removeItem('openhab.ui:password')
      this.serverUrl = ''
      this.username = ''
      this.password = ''
      this.loginScreenOpened = true
      this.loggedIn = false
    }
  },
  created () {
    // this.loginScreenOpened = true
  },
  mounted () {
    this.themeOptions.dark = localStorage.getItem('openhab.ui:theme.dark') || 'light'
    this.themeOptions.bars = localStorage.getItem('openhab.ui:theme.bars') || ((!this.$theme.ios) ? 'filled' : 'light')
    this.themeOptions.homeNavbar = localStorage.getItem('openhab.ui:theme.home.navbar') || 'default'
    this.themeOptions.expandableCardAnimation = localStorage.getItem('openhab.ui:theme.home.cardanimation') || 'default'
    this.themeOptions.pageTransitionAnimation = localStorage.getItem('openhab.ui:theme.home.pagetransition') || 'default'
    this.$f7ready((f7) => {
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

      this.loadSidebarPages()

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
    })
  }
}
</script>
