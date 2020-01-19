<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="stopEventSource">
    <f7-navbar :title="'Add ' + addonType + ' add-on'" back-link="Back">
      <f7-subnavbar :inner="false">
        <f7-searchbar search-container=".search-list" search-in=".item-title" remove-diacritics :disable-button="!$theme.aurora"></f7-searchbar>
      </f7-subnavbar>
    </f7-navbar>
    <f7-list class="searchbar-not-found">
      <f7-list-item title="Nothing found"></f7-list-item>
    </f7-list>
    <f7-block class="block-narrow">
      <f7-col>
        <f7-block-title
          v-if="addons.length"
        >{{addons.length}} Addon{{addons.length > 1 ? 's' : ''}} available</f7-block-title>
        <f7-list media-list class="search-list searchbar-found">
          <f7-list-item
            media-item
            v-for="addon in addons"
            :key="addon.id"
            link="#"
            @click="openAddonPopup(addon.id)"
            :header="addon.id"
            :footer="addon.version"
            :after="(currentlyInstalling.indexOf(addon.id) >= 0) ? 'Installing...' : ''"
            :title="addon.label"
          >
            <!-- <f7-icon slot="media" icon="demo-list-icon"></f7-icon> -->
          </f7-list-item>
        </f7-list>
      </f7-col>
    </f7-block>
    <!-- <addon-details-popup
      :addon-id="currentAddonId"
      :opened="addonPopupOpened"
      @closed="addonPopupOpened = false"
    /> -->
    <addon-details-sheet
      :addon-id="currentAddonId"
      :opened="addonPopupOpened"
      @closed="addonPopupOpened = false"
      @install="installAddon"
    />
  </f7-page>
</template>

<script>
// import AddonDetailsPopup from './addon-details-popup.vue'
import AddonDetailsSheet from './addon-details-sheet.vue'

export default {
  components: {
    // AddonDetailsPopup,
    AddonDetailsSheet
  },
  props: ['addonType'],
  data () {
    return {
      addons: [],
      currentAddonId: null,
      addonPopupOpened: false,
      currentlyInstalling: []
    }
  },
  methods: {
    openAddonPopup (addonId) {
      this.currentAddonId = addonId
      this.addonPopupOpened = true
    },
    onPageAfterIn () {
      this.currentlyInstalling = []
      this.load()
    },
    load () {
      this.$oh.api.get('/rest/extensions').then(data => {
        this.addons = data.filter(addon => !addon.installed && addon.type === this.addonType)
        this.startEventSource()
      }).catch((err) => {
        // sometimes we get 502 errors ('Jersey is not ready yet!'), keep trying
        console.log('Error while accessing the API, retrying every 5 seconds: ', err)
        setTimeout(this.load, 5000)
      })
    },
    installAddon (addon) {
      this.addonPopupOpened = false
      this.currentlyInstalling.push(addon.id)
    },
    startEventSource () {
      this.eventSource = this.$oh.sse.connect('/rest/events?topics=smarthome/extensions/*/*', null, (event) => {
        console.log(event)
        const topicParts = event.topic.split('/')
        switch (topicParts[3]) {
          case 'installed':
          case 'uninstalled':
            this.stopEventSource()
            this.load()
            break
        }
      }, () => {
        // in case of error, maybe the SSE connection was closed by the add-ons change itself - try reloading to refresh
        this.stopEventSource()
        this.load()
      })
    },
    stopEventSource () {
      this.$oh.sse.close(this.eventSource)
      this.eventSource = null
    }
  }
}
</script>

<style>
</style>
