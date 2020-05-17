<template>
  <f7-page name="about" class="page-about">
    <f7-navbar large title-large="About" title="About" back-link="Back"></f7-navbar>
    <f7-block class="block-narrow after-big-title">
      <f7-row>
        <f7-col>
          <!-- <f7-block-title>About openHAB</f7-block-title> -->
          <f7-block>
            <img src="res/icons/128x128.png" width="96" class="padding float-right">
            <h2 class="block-title-medium">openHAB version {{this.$f7.version}}</h2>
            <p><f7-link external target="_blank" href="https://www.openhab.org/">Home page</f7-link></p>
            <p><f7-link external target="_blank" href="https://www.openhab.org/docs/">Documentation</f7-link></p>
            <p><f7-link external target="_blank" href="https://community.openhab.org/">Community forum</f7-link></p>
          </f7-block>
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
  </f7-page>
</template>

<script>
import ThemeSwitcher from '../components/theme-switcher.vue'

export default {
  components: {
    ThemeSwitcher
  },
  data () {
    return {
      showCachePurgeOption: false
    }
  },
  mounted () {
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
  methods: {
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
    }
  }
}
</script>
