<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="addonPopupOpened = false" @page:afterout="stopEventSource">
    <f7-navbar :title="'Add ' + addonType + ' add-ons'" back-link="Back">
      <f7-subnavbar :inner="false" v-show="initSearchbar">
        <f7-searchbar search-container=".addons-list" :init="initSearchbar" v-if="initSearchbar" search-in=".item-title" remove-diacritics :disable-button="!$theme.aurora"></f7-searchbar>
      </f7-subnavbar>
    </f7-navbar>
    <f7-list class="searchbar-not-found">
      <f7-list-item title="Nothing found"></f7-list-item>
    </f7-list>
    <f7-block class="block-narrow searchbar-found">
      <f7-col>
        <f7-block-title v-if="!ready">Loading...</f7-block-title>
        <f7-block-title v-else>{{addons.length}} add-on{{addons.length > 1 ? 's' : ''}} available</f7-block-title>
        <f7-list media-list v-if="!ready">
          <f7-list-item
            v-for="n in 10"
            :key="n"
            :class="`skeleton-text skeleton-effect-blink`"
            title="Label of the binding"
            header="BindingID"
            footer="Binding version"
            media-item
          >
          </f7-list-item>
        </f7-list>
        <f7-list v-else media-list class="addons-list">
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
          </f7-list-item>
        </f7-list>
      </f7-col>
    </f7-block>
    <addon-details-sheet
      v-if="ready"
      :addon-id="currentAddonId"
      :opened="addonPopupOpened"
      @closed="addonPopupOpened = false"
      @install="installAddon"
    />
  </f7-page>
</template>

<script>
import AddonDetailsSheet from './addon-details-sheet.vue'

export default {
  components: {
    AddonDetailsSheet
  },
  props: ['addonType'],
  data () {
    return {
      addons: [],
      currentAddonId: null,
      ready: false,
      initSearchbar: false,
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
        this.ready = true
        setTimeout(() => { this.initSearchbar = true })
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
          case 'failed':
            this.$f7.toast.create({
              text: `Installation of add-on ${topicParts[2]} failed`,
              closeButton: true,
              destroyOnClose: true
            }).open()
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
