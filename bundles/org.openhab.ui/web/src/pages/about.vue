<template>
  <f7-page name="about" class="page-about" @page:beforein="beforePageIn">
    <f7-navbar large title-large="About" title="About" back-link="Back"></f7-navbar>
    <f7-block class="block-narrow after-big-title">
      <f7-row>
        <f7-col>
          <!-- <f7-block-title>About openHAB</f7-block-title> -->
          <f7-block>
            <img src="res/icons/128x128.png" width="96" class="padding float-right">
            <h2 v-if="$store.state.runtimeInfo" class="block-title-medium">openHAB {{$store.state.runtimeInfo.version}}<br/><small>{{$store.state.runtimeInfo.buildString}}</small></h2>
            <p><f7-link external target="_blank" href="https://www.openhab.org/">Home page</f7-link></p>
            <p><f7-link external target="_blank" href="https://www.openhab.org/docs/">Documentation</f7-link></p>
            <p><f7-link external target="_blank" href="https://community.openhab.org/">Community forum</f7-link></p>
          </f7-block>
        </f7-col>
      </f7-row>
      <f7-row v-if="systemInfo">
        <f7-col>
          <f7-list accordion-list>
            <f7-list-item title="Technical Information" accordion-item>
              <f7-accordion-content>
                <f7-list>
                  <f7-list-item title="Configuration Folder" :after="systemInfo.configFolder"></f7-list-item>
                  <f7-list-item title="User Data Folder" :after="systemInfo.userdataFolder"></f7-list-item>
                  <f7-list-item title="Logs Folder" :after="systemInfo.logFolder"></f7-list-item>
                  <f7-list-item title="Operating System" :after="`${systemInfo.osName}/${systemInfo.osVersion} (${systemInfo.osArchitecture})`"></f7-list-item>
                  <f7-list-item title="Java Runtime" :footer="systemInfo.javaVendor" :after="`${systemInfo.javaVersion} (${systemInfo.javaVendorVersion})`">
                    <div slot="root-end" class="item-content" style="flex-direction: column">
                      <f7-progressbar class="margin-top" style="width: 90%" color="blue" :progress="systemInfo.freeMemory * 100 / systemInfo.totalMemory" />
                      <small class="margin-bottom text-color-gray">
                        {{systemInfo.availableProcessors}} available processors · {{Math.round(systemInfo.freeMemory / 1024 / 1024)}}/{{Math.round(systemInfo.totalMemory / 1024 / 1024)}}MB available memory<br />
                      </small>
                    </div>
                  </f7-list-item>
                  <f7-list-button color="blue" @click="textualSystemInfoOpened = true">View details</f7-list-button>
                </f7-list>
              </f7-accordion-content>
            </f7-list-item>
          </f7-list>
        </f7-col>
      </f7-row>

      <f7-block-title><h4>Appearance Options (local to this device)</h4></f7-block-title>
      <theme-switcher />

      <f7-block-title><h4>Reload</h4></f7-block-title>
      <f7-col v-if="showCachePurgeOption">
        <p class="padding-horizontal">Caches and/or service workers are in use to store resources locally and make this app load faster, however it may not reliably detect when it has been updated to a new version.</p>
        <p class="padding-horizontal">Select Purge Caches and Refresh below to clear all caches, unregister service workers and download everything from the server again.</p>
      </f7-col>
      <f7-col>
        <f7-list>
          <f7-list-button v-if="showCachePurgeOption" color="red" @click="purgeServiceWorkerAndCaches()">Purge Caches and Refresh</f7-list-button>
          <f7-list-button color="blue" @click="reload">Reload the App</f7-list-button>
        </f7-list>
      </f7-col>
    </f7-block>
    <f7-popup :opened="textualSystemInfoOpened" close-on-escape @popup:closed="textualSystemInfoOpened = false">
      <f7-page>
        <f7-toolbar>
          <div class="left">
            <f7-link @click="copyTextualSystemInfo">Copy</f7-link>
          </div>
          <div class="right">
            <f7-link popup-close>Close</f7-link>
          </div>
        </f7-toolbar>
        <!-- <pre class="textual-definition" v-html="textualDefinition"></pre> -->
        <textarea readonly class="textual-systeminfo" id="textual-systeminfo" :value="textualSystemInfo"></textarea>
      </f7-page>
    </f7-popup>
  </f7-page>
</template>

<style lang="stylus" scoped>
code.textual-systeminfo pre
  overflow auto
  white-space normal

pre.textual-systeminfo
  padding 5px

textarea.textual-systeminfo
  position absolute
  top calc(var(--f7-safe-area-top) + var(--f7-toolbar-height))
  bottom 0
  padding-left 5px
  width calc(100% - var(--f7-safe-area-left) - var(--f7-safe-area-right))
  height calc(100% - var(--f7-safe-area-top) - var(--f7-safe-area-bottom) - var(--f7-toolbar-height))
  top calc(var(--f7-safe-area-top) + var(--f7-toolbar-height))
  font-family monospace
  font-size 12px
</style>

<script>
import ThemeSwitcher from '../components/theme-switcher.vue'
import YAML from 'yaml'

export default {
  components: {
    ThemeSwitcher
  },
  data () {
    return {
      systemInfo: null,
      textualSystemInfoOpened: false,
      showCachePurgeOption: false,
      bindings: null
    }
  },
  computed: {
    textualSystemInfo () {
      if (!this.textualSystemInfoOpened) return ''
      return YAML.stringify({
        runtimeInfo: this.$store.state.runtimeInfo,
        locale: this.$store.state.locale,
        systemInfo: this.systemInfo,
        bindings: this.bindings,
        clientInfo: {
          device: Object.assign({}, this.$device, { prefersColorScheme: this.$device.prefersColorScheme() }),
          isSecureContext: window.isSecureContext,
          locationbarVisible: (window.locationbar) ? window.locationbar.visible : 'N/A',
          menubarVisible: (window.menubar) ? window.menubar.visible : 'N/A',
          navigator: {
            cookieEnabled: navigator.cookieEnabled,
            deviceMemory: navigator.deviceMemory || 'N/A',
            hardwareConcurrency: navigator.hardwareConcurrency || 'N/A',
            language: navigator.language,
            languages: navigator.languages,
            onLine: navigator.onLine,
            platform: navigator.platform
          },
          screen: { width: window.screen.width, height: window.screen.height, colorDepth: window.screen.colorDepth },
          support: this.$f7.support,
          themeOptions: this.$f7.data.themeOptions,
          userAgent: window.navigator.userAgent
        },
        timestamp: new Date()
      })
    }
  },
  methods: {
    beforePageIn () {
      if (this.$store.getters.isAdmin) {
        this.$oh.api.get('/rest/systeminfo').then((data) => { this.systemInfo = data.systemInfo })
        this.$oh.api.get('/rest/bindings').then((data) => { this.bindings = data.map((b) => b.id).sort() })
      }
      if (navigator.serviceWorker) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          if (registrations.length > 0) {
            this.showCachePurgeOption = true
          }
        })
      }
      if (window.caches) {
        window.caches.keys().then((cachesNames) => {
          if (cachesNames.length > 0) {
            this.showCachePurgeOption = true
          }
        })
      }
    },
    purgeServiceWorkerAndCaches () {
      this.$f7.dialog.confirm(
        'Purge all application caches and unregister the service workers? This will also reload the page from the server, which might take a few seconds.',
        () => {
          navigator.serviceWorker.getRegistrations().then(function (registrations) {
            for (let registration of registrations) {
              registration.unregister().then(function () {
                return self.clients.matchAll()
              }).then(function (clients) {
                clients.forEach(client => {
                  if (client.url && 'navigate' in client) {
                    setTimeout(() => { client.navigate(client.url.split('#')[0]) }, 1000)
                  }
                })
              })
            }
          })
          window.caches.keys().then(function (cachesNames) {
            console.log('Deleting caches')
            return Promise.all(cachesNames.map(function (cacheName) {
              return caches.delete(cacheName).then(function () {
                console.log('Cache with name ' + cacheName + ' is deleted')
              })
            }))
          }).then(function () {
            console.log('Caches deleted')
            setTimeout(() => { location.reload(true) }, 1000)
          })
        }
      )
    },
    reload () {
      document.location.reload()
    },
    copyTextualSystemInfo () {
      let el = document.getElementById('textual-systeminfo')
      el.select()
      document.execCommand('copy')
      this.$f7.toast.create({
        text: 'Copied to clipboard',
        destroyOnClose: true,
        closeTimeout: 2000
      }).open()
    }
  }
}
</script>
