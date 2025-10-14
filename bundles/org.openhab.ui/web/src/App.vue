<template>
  <f7-app
    v-if="init"
    v-bind="f7params"
    :style="{
      visibility:
        userStore.user || componentsStore.page('overview') || communicationFailureMsg
          ? ''
          : 'hidden'
    }">
    <!-- Left Panel -->
    <f7-panel
      v-show="ready"
      left
      :cover="showSidebar ? true : null"
      class="sidebar"
      :visible-breakpoint="1024">
      <f7-page>
        <f7-link href="/overview/" class="openhab-logo no-ripple" panel-close>
          <div class="logo-inner">
            <img
              v-if="uiOptionsStore.getDarkMode() === 'dark'"
              src="@/images/openhab-logo-white.svg"
              type="image/svg+xml"
              width="196px">
            <img v-else
                 src="@/images/openhab-logo.svg"
                 type="image/svg+xml"
                 width="196px">
          </div>
        </f7-link>
        <f7-link class="breakpoint-pin" @click="toggleVisibleBreakpoint">
          <f7-icon
            size="14"
            :f7="uiOptionsStore.visibleBreakpointDisabled ? 'pin_slash' : 'pin'"
            color="gray" />
        </f7-link>

        <f7-list v-if="ready">
          <f7-list-item v-if="runtimeStore.apiEndpoint('ui') && (!pages || !pages.length)">
            <span><em>{{ t('sidebar.noPages') }}</em></span>
          </f7-list-item>
          <f7-list-item
            v-for="page in pages"
            :animate="false"
            :key="page.uid"
            :class="{ currentsection: currentPath.page?.[page.uid] }"
            :link="'/page/' + page.uid"
            :title="page.config.label"
            view=".view-main"
            panel-close>
            <template #media>
              <oh-icon :icon="pageIcon(page)" height="18" width="18" />
            </template>
          </f7-list-item>
        </f7-list>
        <f7-block-title
          v-if="userStore.isAdmin()">
          {{ t('sidebar.administration') }}
        </f7-block-title>
        <!-- Settings -->
        <f7-list class="admin-links" v-if="userStore.isAdmin()">
          <f7-list-item
            link="/settings/"
            :title="t('sidebar.settings')"
            view=".view-main"
            panel-close
            :animate="false"
            :class="{
              currentsection:
                currentPath.settings?.$end ||
                currentPath.settings?.services ||
                currentPath.settings?.addons ||
                currentPath.settings?.persistence ||
                currentPath.settings?.transformations,
            }">
            <template #media>
              <f7-icon
                ios="f7:gear_alt_fill"
                aurora="f7:gear_alt_fill"
                md="material:settings"
                color="gray" />
            </template>
          </f7-list-item>
          <li v-if="currentPath.settings">
            <ul class="menu-sublinks">
              <f7-list-item
                v-if="runtimeStore.apiEndpoint('things')"
                link="/settings/things/"
                title="Things"
                view=".view-main"
                panel-close
                :animate="false"
                no-chevron
                :class="{ currentsection: currentPath.settings?.things }">
                <template #media>
                  <f7-icon f7="lightbulb" color="gray" />
                </template>
              </f7-list-item>
              <f7-list-item
                v-if="runtimeStore.apiEndpoint('items')"
                link="/settings/model/"
                title="Model"
                view=".view-main"
                panel-close
                :animate="false"
                no-chevron
                :class="{ currentsection: currentPath.settings?.model }">
                <template #media>
                  <f7-icon f7="list_bullet_indent" color="gray" />
                </template>
              </f7-list-item>
              <f7-list-item
                v-if="runtimeStore.apiEndpoint('items')"
                link="/settings/items/"
                title="Items"
                view=".view-main"
                panel-close
                :animate="false"
                no-chevron
                :class="{ currentsection: currentPath.settings?.items }">
                <template #media>
                  <f7-icon f7="square_on_circle" color="gray" />
                </template>
              </f7-list-item>
              <f7-list-item
                v-if="runtimeStore.apiEndpoint('ui')"
                link="/settings/pages/"
                title="Pages"
                view=".view-main"
                panel-close
                :animate="false"
                no-chevron
                :class="{ currentsection: currentPath.settings?.pages }">
                <template #media>
                  <f7-icon f7="tv" color="gray" />
                </template>
              </f7-list-item>
              <f7-list-item
                v-if="runtimeStore.apiEndpoint('rules')"
                link="/settings/rules/"
                title="Rules"
                view=".view-main"
                panel-close
                :animate="false"
                no-chevron
                :class="{ currentsection: currentPath.settings?.rules }">
                <template #media>
                  <f7-icon f7="wand_stars" color="gray" />
                </template>
              </f7-list-item>
              <f7-list-item
                v-if="runtimeStore.apiEndpoint('rules')"
                link="/settings/scenes/"
                title="Scenes"
                view=".view-main"
                panel-close
                :animate="false"
                no-chevron
                :class="{ currentsection: currentPath.settings?.scenes }">
                <template #media>
                  <f7-icon f7="film" color="gray" />
                </template>
              </f7-list-item>
              <f7-list-item
                v-if="runtimeStore.apiEndpoint('rules')"
                link="/settings/scripts/"
                title="Scripts"
                view=".view-main"
                panel-close
                :animate="false"
                no-chevron
                :class="{ currentsection: currentPath.settings?.scripts }">
                <template #media>
                  <f7-icon f7="doc_plaintext" color="gray" />
                </template>
              </f7-list-item>
              <f7-list-item
                v-if="runtimeStore.apiEndpoint('rules')"
                link="/settings/schedule/"
                title="Schedule"
                view=".view-main"
                panel-close
                :animate="false"
                no-chevron
                :class="{ currentsection: currentPath.settings?.schedule }">
                <template #media>
                  <f7-icon f7="calendar" color="gray" />
                </template>
              </f7-list-item>
            </ul>
          </li>

          <!-- Add-on Store -->
          <f7-list-item
            link="/addons/"
            :title="t('sidebar.addOnStore')"
            view=".view-main"
            panel-close
            :animate="false"
            :class="{ currentsection: currentPath.addons?.$end }">
            <template #media>
              <f7-icon
                ios="f7:bag_fill"
                aurora="f7:bag_fill"
                md="material:shopping_bag"
                color="gray" />
            </template>
          </f7-list-item>
          <li v-if="currentPath.addons && runtimeStore.apiEndpoint('addons')">
            <ul class="menu-sublinks">
              <f7-list-item
                v-for="section in Object.keys(AddonTitles)"
                :key="section"
                :link="`/addons/${section}/`"
                :title="AddonTitles[section]"
                view=".view-main"
                panel-close
                :animate="false"
                no-chevron
                :class="{ currentsection: currentPath.addons?.[section] }">
                <template #media>
                  <f7-icon :f7="AddonIcons[section]" color="gray" />
                </template>
              </f7-list-item>
            </ul>
          </li>

          <!-- Developer Tools -->
          <f7-list-item
            link="/developer/"
            :title="t('sidebar.developerTools')"
            panel-close
            :animate="false"
            :class="{ currentsection: currentPath.developer?.$end }">
            <template #media>
              <f7-icon
                ios="f7:wrench_fill"
                aurora="f7:wrench_fill"
                md="material:construction"
                color="gray" />
            </template>
          </f7-list-item>
          <li v-if="currentPath.developer">
            <ul class="menu-sublinks">
              <f7-list-item
                v-if="runtimeStore.apiEndpoint('ui')"
                link="/developer/widgets/"
                title="Widgets"
                view=".view-main"
                panel-close
                :animate="false"
                no-chevron
                :class="{ currentsection: currentPath.developer?.widgets }">
                <template #media>
                  <f7-icon f7="rectangle_on_rectangle_angled" color="gray" />
                </template>
              </f7-list-item>
              <f7-list-item
                v-if="runtimeStore.apiEndpoint('ui')"
                link="/developer/blocks/"
                title="Block Libraries"
                view=".view-main"
                panel-close
                :animate="false"
                no-chevron
                :class="{ currentsection: currentPath.developer?.blocks }">
                <template #media>
                  <f7-icon f7="ticket" color="gray" />
                </template>
              </f7-list-item>
              <f7-list-item
                link="/developer/api-explorer/"
                title="API Explorer"
                view=".view-main"
                panel-close
                :animate="false"
                no-chevron
                :class="{
                  currentsection: currentPath.developer?.['api-explorer'],
                }">
                <template #media>
                  <f7-icon f7="burn" color="gray" />
                </template>
              </f7-list-item>
              <f7-list-item
                link="/developer/log-viewer/"
                title="Log Viewer"
                view=".view-main"
                panel-close
                :animate="false"
                no-chevron
                :class="{
                  currentsection: currentPath.developer?.['log-viewer'],
                }">
                <template #media>
                  <f7-icon f7="square_list" color="gray" />
                </template>
              </f7-list-item>
              <!-- <f7-list-item link="" @click="f7.emit('toggleDeveloperDock')" title="Dock" view=".view-main" panel-close :animate="false" no-chevron>
                <f7-icon :f7="runtimeStore.showDeveloperDock ? 'wrench_fill' : 'wrench'" color="gray" />
              </f7-list-item> -->
            </ul>
          </li>
        </f7-list>

        <f7-list class="admin-links">
          <f7-list-item
            link="/about/"
            :title="t('sidebar.helpAbout')"
            view=".view-main"
            panel-close
            :class="{ currentsection: currentPath.about }">
            <template #media>
              <f7-icon
                ios="f7:question_circle_fill"
                aurora="f7:question_circle_fill"
                md="material:help"
                color="gray" />
            </template>
          </f7-list-item>
        </f7-list>

        <template #fixed>
          <div class="account" v-if="ready && runtimeStore.apiEndpoint('auth')">
            <div class="display-flex justify-content-center">
              <div
                v-if="
                  !userStore.user &&
                    !componentsStore.pages().filter(p => p.uid !== 'overview').length"
                class="hint-signin">
                <em>{{ t('sidebar.tip.signIn') }}<br><f7-icon f7="arrow_down" size="20" /></em>
              </div>
              <f7-button
                @click="authorize(false)"
                v-if="!loggedIn"
                icon-f7="lock_shield_fill"
                large
                color="gray"
                icon-size="34"
                :tooltip="t('sidebar.unlockAdmin')" />
            </div>
            <f7-list v-if="userStore.user" media-list>
              <f7-list-item
                :title="userStore.user.name"
                :footer="serverDisplayUrl"
                link="/profile/"
                no-chevron
                panel-close
                view=".view-main"
                :class="{ currentsection: currentPath.profile }">
                <template #media>
                  <f7-icon
                    size="36"
                    ios="f7:person_alt_circle_fill"
                    aurora="f7:person_alt_circle_fill"
                    md="f7:person_alt_circle_fill"
                    color="gray" />
                </template>
              </f7-list-item>
            </f7-list>
          </div>
        </template>
      </f7-page>
    </f7-panel>

    <!-- Right Panel -->
    <f7-panel right
              reveal
              dark
              v-if="ready">
      <panel-right />
      <!-- <f7-view url="/panel-right/"></f7-view> -->
    </f7-panel>

    <f7-panel v-if="runtimeStore.showDeveloperDock"
              right
              :visible-breakpoint="1280"
              resizable>
      <developer-dock
        :dock="activeDock"
        :helpTab="activeHelpTab"
        :toolTab="activeToolTab"
        :searchFor="developerSearch" />
    </f7-panel>

    <f7-block v-if="!ready && communicationFailureMsg" class="block-narrow">
      <empty-state-placeholder
        icon="wifi_slash"
        :title="t('error.notReachable.title')"
        :text="t('error.notReachable.msg') + '<br/><br/>Error: ' + communicationFailureMsg" />
      <f7-col>
        <f7-list>
          <f7-list-button color="blue" @click="loadData">
            {{ t('dialogs.retry') }}
          </f7-list-button>
          <f7-list-button color="blue" @click="reload">
            {{ t('about.reload.reloadApp') }}
          </f7-list-button>
          <f7-list-button
            v-if="showCachePurgeOption"
            color="red"
            @click="purgeServiceWorkerAndCaches">
            {{ t('about.reload.purgeCachesAndRefresh') }}
          </f7-list-button>
        </f7-list>
      </f7-col>
    </f7-block>

    <f7-view
      url="/"
      :main="true"
      class="safe-areas"
      :master-detail-breakpoint="960"
      :browser-history="true"
      browser-history-separator=""
      browser-history-root=""
      v-show="ready"
      :animate="uiOptionsStore.disablePageTransitionAnimation ? null : true" />
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
      ul
        height 100%
  .breakpoint-pin
    position fixed
    top calc(var(--f7-safe-area-top))
    right 0
    margin 12px 10px
    opacity 0
  @media (min-width 960px)
    .breakpoint-pin
      opacity 0.75

.aurora
  .account
    --f7-list-item-padding-vertical 4px
    .item-title-row::before
      visibility hidden

.dark
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
import { nextTick, defineAsyncComponent } from 'vue'
import { request } from 'framework7'
import { f7, f7ready } from 'framework7-vue'
import { mapStores } from 'pinia'

import buildInfo from '@/assets/build-info'

import routes from '@/js/routes.js'
import PanelRight from '@/pages/panel-right.vue'
import EmptyStatePlaceholder from '@/components/empty-state-placeholder.vue'

import { useRuntimeStore } from '@/js/stores/useRuntimeStore'

import auth from '@/components/auth-mixin'
import connectionHealth from '@/components/connection-health-mixin'
import sseEvents from '@/components/sse-events-mixin'

import { i18n, loadLocaleMessages } from '@/js/i18n'
import dayjs from 'dayjs'
import dayjsLocales from 'dayjs/locale.json'
import { useI18n } from 'vue-i18n'

import { AddonIcons, AddonTitles } from '@/assets/addon-store'

import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'
import { useStatesStore } from '@/js/stores/useStatesStore'
import { useUserStore } from '@/js/stores/useUserStore'
import { useComponentsStore } from '@/js/stores/useComponentsStore'
import { useSemanticsStore } from '@/js/stores/useSemanticsStore'
import { useModelStore } from '@/js/stores/useModelStore'

export default {
  mixins: [auth, connectionHealth, sseEvents],
  components: {
    EmptyStatePlaceholder,
    PanelRight,
    DeveloperDock: defineAsyncComponent(() => import(/* webpackChunkName: "admin-base" */ '@/components/developer/developer-dock.vue'))
  },
  setup () {
    const { locale, mergeLocaleMessage : globalMergeLocaleMessage } = useI18n({ useScope: 'global'})
    const { t, mergeLocaleMessage : localMergeLocaleMessage } = useI18n({ useScope: 'local'})
    // required for notReachable error screen:
    loadLocaleMessages('common', globalMergeLocaleMessage)
    loadLocaleMessages('about', localMergeLocaleMessage)
    loadLocaleMessages('empty-states', localMergeLocaleMessage)

    return {
      t,
      localMergeLocaleMessage,
      globalMergeLocaleMessage,
      locale
    }
  },
  data () {
    let theme = localStorage.getItem('openhab.ui:theme')

    if ((!theme || theme === 'auto') && typeof window.OHApp?.preferTheme === 'function') {
      theme = window.OHApp.preferTheme()
    }

    // choose Aurora as the default theme for desktops
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
        autoDarkMode: useUIOptionsStore().isAutoDarkMode(),
        // App routes
        routes,
        // Enable panel left visibility breakpoint
        panel: {
          leftBreakpoint: 960,
          rightBreakpoint: 1280
        },

        // Register service worker
        serviceWorker:
          location.hostname === 'localhost'
            ? {}
            : {
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
      },

      pages: null,
      showSidebar: true,
      loggedIn: false,

      activeDock: 'tools',
      activeToolTab: 'pin',
      activeHelpTab: 'current',
      developerSearch: null,
      currentUrl: ''
    }
  },
  computed: {
    currentPath () {
      // Returns a hierarchical object representation of the currentUrl.
      //   '/settings/services/openhabcloud/' -> currentPath.settings.services.openhabcloud
      //   { $key: 'settings', settings: { $key: 'services', services: { $key: 'openhabcloud', openhabcloud: { $end: true } } } }
      // When the object has no sub-objects, it will contain '$end': true:
      //   '/settings/' -> currentPath.settings.$end is true
      //   '/settings/addons/' -> currentPath.settings.$end is undefined, but currentPath.settings.addons.$end is true
      // To ease traversing the object, each level also has a '$key' property containing the name of the segment
      //   '/settings/services/openhabcloud/' -> currentPath.$key: 'settings', currentPath.settings.$key: 'services', and so on.
      return this.currentUrl
        .replace(/\?.*$/, '') // strip query parameters
        .replace(/^\/|\/$/g, '') // strip leading and trailing slashes
        .split('/')
        .reduceRight(
          (a, b) => {
            return { $key: b, [b]: a }
          },
          { $end: true }
        )
    },
    serverDisplayUrl () {
      return window.location.origin
    },
    ...mapStores(useUIOptionsStore, useComponentsStore, useUserStore, useRuntimeStore)
  },
  watch: {
    'statesStore.sseConnected': {
      handler: function (connected) {
        console.debug('sseConnected', connected)
        if (typeof window.OHApp?.sseConnected === 'function') {
          try {
            window.OHApp.sseConnected(connected)
          } catch {}
        }
      },
      immediate: true // provides initial (not changed yet) state
    },
    'runtimeStore.locale': {
      handler: function (newValue, oldValue) {
        console.debug('App locale change', newValue)
        // update i18n globals
        this.locale = useRuntimeStore().locale

        loadLocaleMessages('common', this.globalMergeLocaleMessage).then(() => {
          f7.params.dialog.buttonOk = this.$t('dialogs.ok')
          f7.params.dialog.buttonCancel = this.$t('dialogs.cancel')
          f7.params.smartSelect.searchbarDisableText = this.$t('dialogs.cancel')
          f7.params.smartSelect.searchbarPlaceholder = this.$t('dialogs.search')
          f7.params.smartSelect.sheetCloseLinkText = this.$t('dialogs.done')
          f7.params.smartSelect.popupCloseLinkText = this.$t('dialogs.close')
          f7.params.smartSelect.pageBackLinkText = this.$t('dialogs.back')
          f7.params.smartSelect.nothingFoundText = this.$t('dialogs.search.nothingFound')
        })
          .catch((err) => {
            console.error('Error loading locale messages: ', err)
          })

        loadLocaleMessages('about', this.globalMergeLocaleMessage)
      }
    }
  },
  methods: {
    loadData (useCredentials) {
      performance.mark('loadDataStart')
      const useCredentialsPromise = useCredentials ? this.setBasicCredentials() : Promise.resolve()
      return useCredentialsPromise
        .then(() => {
          return request.json('/rest')
        })
        .catch((err) => {
          console.error('openHAB REST API connection failed with error:')
          console.info(err)
          if (err.message === 'Unauthorized' || err.status === 401) {
            if (!useCredentials) {
              // try again with credentials
              this.loadData(true)
              return Promise.reject()
            }
            nextTick(() => {
              f7.dialog.login(
                window.location.host,
                'openHAB',
                (username, password) => {
                  this.setBasicCredentials(username, password)
                  this.$oh.api
                    .get('/rest/')
                    .then((rootResponse) => {
                      this.storeBasicCredentials()
                      this.loadData()
                    })
                    .catch((err) => {
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
              err.xhr
                .getAllResponseHeaders()
                .trim()
                .split(/[\r\n]+/)
                .forEach((line) => {
                  const parts = line.split(':\t')
                  headersObj[parts[0]] = parts[1]
                })
              // Redirect according to location header but modify URL arguments to redirect back to the UI and not the REST API after authentication
              window.location.replace(
                headersObj['location'].replace(window.location.href + 'rest', window.location.href)
              )
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
            return Promise.reject(
              'openHAB REST API connection failed with error: ' + err.message || err.status
            )
          }
        })
        .then((res) => res.data)
        .then((rootResponse) => {
          // store the REST API services present on the system
          useRuntimeStore().setRootResource(rootResponse)
          if (!useRuntimeStore().apiEndpoint('auth')) useUserStore().setNoAuth(true)
          return rootResponse
        })
        .then((rootResponse) => {
          const locale = useRuntimeStore().locale.toLocaleLowerCase()
          let dayjsLocalePromise = Promise.resolve(null)
          // try to resolve the dayjs file to load if it exists
          if (locale) {
            const dayjsLocale = dayjsLocales.find(
              (l) => l.key === locale || l.key === locale.split('-')[0]
            )

            dayjsLocalePromise = dayjsLocale
              ? import(`../node_modules/dayjs/esm/locale/${dayjsLocale.key}.js`)
                .then(() => {
                  return dayjsLocale
                }).catch((error) => {
                  console.error('Error fetching dayjs: ', error, dayjsLocale)
                })
              : Promise.resolve(null)
          }
          return Promise.all([
            ...(useRuntimeStore().apiEndpoint('ui'))
              ? [this.$oh.api.get('/rest/ui/components/ui:page'), this.$oh.api.get('/rest/ui/components/ui:widget')]
              : [Promise.resolve([]), Promise.resolve([])],
            dayjsLocalePromise,
            useSemanticsStore().loadSemantics(i18n)
          ])
        })
        .then((data) => {
          useComponentsStore().setPagesAndWidgets(data[0], data[1])
          this.pages = useComponentsStore().pages()
            .filter((p) => p.config.sidebar && this.pageIsVisible(p))
            .sort((p1, p2) => {
              const order1 = p1.config.order || 1000
              const order2 = p2.config.order || 1000
              return order1 - order2
            })
          this.updateTitle()

          if (data[2]) dayjs.locale(data[2].key)

          // load & build the semantic model
          useModelStore().loadSemanticModel()
        })
        .then(() => {
          // finished with loading
          this.ready = true
          return Promise.resolve()
        })
    },
    pageIsVisible (page) {
      if (!page.config.visibleTo) return true
      if (useUserStore().noAuth) return true
      const user = useUserStore().user
      if (!user) return false
      if (user.roles && user.roles.some((r) => page.config.visibleTo.indexOf('role:' + r) >= 0))
        return true
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
      useUIOptionsStore().updateClasses()
    },
    toggleDeveloperDock () {
      if (!useUserStore().isAdmin()) return
      useRuntimeStore().showDeveloperDock = !useRuntimeStore().showDeveloperDock
      if (useRuntimeStore().showDeveloperDock) useStatesStore().startTrackingStates()
    },
    selectDeveloperDock (dockOpts) {
      if (dockOpts) {
        if (dockOpts.dock) this.activeDock = dockOpts.dock
        if (dockOpts.helpTab) this.activeHelpTab = dockOpts.helpTab
        if (dockOpts.toolTab) this.activeToolTab = dockOpts.toolTab
        if (dockOpts.searchFor) {
          if (this.developerSearch === dockOpts.searchFor) {
            // if the search term is the same, reset the search
            this.developerSearch = ''
          }
          // set the search term in nextTick to allow the reset to register in the developer-sidebar's watched prop
          nextTick(() => {
            this.developerSearch = dockOpts.searchFor
          })
        }
      }
      if (!useRuntimeStore().showDeveloperDock) this.toggleDeveloperDock()
    },
    toggleVisibleBreakpoint () {
      f7.panel.get('left').toggleVisibleBreakpoint()
      useUIOptionsStore().visibleBreakpointDisabled = f7.panel.get('left').visibleBreakpointDisabled
    },
    keyDown (ev) {
      if (ev.shiftKey && ev.altKey) {
        switch (ev.keyCode) {
          case 68: // D for developer dock
            this.toggleDeveloperDock()
            break
          case 77: // M for menu
            const leftPanel = f7.panel.get('left')
            if(leftPanel.opened) {
              leftPanel.close()
            } else {
              leftPanel.open()
            }
            break
          default:
            return
        }
        ev.stopPropagation()
        ev.preventDefault()
      }
    },
    updateUrl (newUrl) {
      this.currentUrl = newUrl
      useRuntimeStore().pagePath = this.currentUrl
    },
    updateTitle () {
      const title = [this.f7params.name] // ['openHAB']
      const navbarTitle = () => {
        return this.$$('.page-current .navbar .title')?.[0]?.textContent
      }

      // Some special cases where the title should be different
      if (this.currentPath.page) {
        title.unshift(useComponentsStore().page(this.currentPath.page?.$key)?.config?.label)
      } else if (this.currentPath.overview) {
        const config = useComponentsStore().page('overview')?.config
        const localizedTitle = this.t(`home.${this.currentPath.$key}.title`)
        title.unshift(
          config?.browserTitle || (config?.label === 'Overview' ? localizedTitle : config?.label)
        )
      } else if (
        this.currentPath.locations ||
        this.currentPath.equipment ||
        this.currentPath.properties
      ) {
        title.unshift(this.t(`home.${this.currentPath.$key}.title`))
      } else if (this.currentPath.settings?.addons && navbarTitle()) {
        // The navbar title on these pages starts with "Configure ....", so don't add "Settings" in front of it
        title.unshift(navbarTitle())
      } else {
        // Get the 3rd level path object
        // Example: '/settings/things/[uid]' -> {key: '[uid]', '[uid]': {$end: true}}
        let path = this.currentPath[this.currentPath.$key] // 2nd level
        path = path[path.$key] // 3rd level

        if (this.currentPath.settings?.pages) {
          // The url in Settings -> Pages section is /settings/pages/[pagetype]/[pageid]
          // We don't want [pagetype], so skip further down the path
          path = path[path.$key]
        } else if (this.currentPath.addons && path?.$key) {
          // The url in Add-ons section is /addons/[type]/[type]-[addonid]
          // We don't want [type] in the last segment
          path = { $key: path.$key.split('-')[1] || path.$key }
        }

        if (this.currentPath.settings?.services && navbarTitle()) {
          // Use a friendlier title for the services pages
          title.unshift(navbarTitle())
        } else {
          // Use the path segment, e.g. Item_Id, binding:thingtype:thingid, etc.
          title.unshift(path?.$key)
        }

        let currentSection = this.$$('.currentsection .item-title')?.[0]?.textContent
        if (this.currentPath.settings?.transformations) {
          currentSection = 'Transformations'
        } else if (this.currentPath.settings?.persistence) {
          currentSection = 'Persistence'
        }
        title.unshift(currentSection)
      }
      document.title = title.filter((t) => t).join(' - ')
    }
  },
  created () {
    this.AddonIcons = AddonIcons
    this.AddonTitles = AddonTitles

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
      this.refreshAccessToken()
        .then(() => {
          this.loggedIn = true
          this.init = true
        })
        .catch((err) => {
          console.warn(
            'Error while using the stored refresh_token to get a new access_token: ' +
              err +
              '. Logging out & cleaning session.'
          )
          this.cleanSession()
          this.init = true
        })
    } else {
      this.init = true
    }
  },
  mounted () {
    f7ready(async (f7) => {
      this.$f7dim.width = f7.width
      this.$f7dim.height = f7.height

      performance.mark('f7ready')
      this.updateThemeOptions()

      this.tryExchangeAuthorizationCode().then((user) => {
        this.loggedIn = true
        this.loadData()
      }).catch((err) => {
        if (err) {
          f7.dialog.alert('An error occurred while getting authorization: ' + err)
        } else {
          // we're just not signed in
          const refreshToken = this.getRefreshToken()
          this.loadData().then(() => {
            if (
              !refreshToken &&
              useRuntimeStore().apiEndpoint('ui') &&
              !useComponentsStore().page('overview')
            ) {
              // as there is no overview page, assume the setup wizard hasn't run yet so launch it right away
              this.authorize(true)
            }
          })
        }
      })

      f7.on('routeChange', (route) => {
        // console.log('Route changed:', route.url)
        // console.log('Browser history state:', history.state) // Native browser history state
      })

      f7.on('pageBeforeIn', (page) => {
        if (page.route && page.route.url) {
          // console.log('pageBeforeIn: current URL:', page.route.url)
          this.updateUrl(page.route.url)
        }
      })

      f7.on('pageAfterIn', (page) => {
        // console.log('pageAfterIn: current URL:', page.route.url)
        // console.log('Full route object:', page.route)
        nextTick(this.updateTitle)
      })

      // needed by updateCurrentUrl() inside addon-store onTabShow()
      f7.on('routeUrlUpdate', (newRoute, router) => {
        // console.log('Route URL updated:', newRoute.url)
        this.updateUrl(newRoute.url)
        nextTick(this.updateTitle)
      })

      f7.on('sidebarRefresh', () => {
        this.loadData()
      })

      f7.on('localeChange', () => {
        this.loadData()
      })

      f7.on('addonChange', () => {
        this.loadData()
      })

      f7.on('darkModeChange', () => {
        this.updateThemeOptions()
      })

      f7.on('toggleDeveloperDock', () => {
        console.log('toggling developer dock')
        this.toggleDeveloperDock()
      })

      f7.on('selectDeveloperDock', (opts) => {
        this.selectDeveloperDock(opts)
      })

      f7.on('smartSelectOpened', (smartSelect) => {
        if (smartSelect && smartSelect.searchbar && this.$device.desktop) {
          smartSelect.searchbar.$inputEl.focus()
        }
      })

      f7.on('resize', () => {
        this.$f7dim.width = f7.width
        this.$f7dim.height = f7.height
      })

      if (window) {
        window.addEventListener('keydown', this.keyDown)
      }

      this.startEventSource()
    })
  }
}
</script>
