<template>
  <f7-page @page:afterin="onPageAfterIn" @page:afterout="stopEventSource">
    <f7-navbar :title="'Add-ons: ' + addonType" back-link="Settings" back-link-url="/settings/" back-link-force>
      <!-- <f7-nav-right>
        <f7-link href="add">Add</f7-link>
      </f7-nav-right>-->
    </f7-navbar>
    <f7-block form v-if="addons.length" class="service-config block-narrow">
      <f7-col>
        <f7-block-title>{{addons.length}} Add-on{{addons.length > 1 ? 's' : ''}} installed</f7-block-title>
        <f7-list media-list>
          <f7-list-item
            media-item
            link="#"
            v-for="addon in addons"
            :key="addon.id"
            @click="openAddonPopup(addon.id)"
            :header="addon.id"
            :footer="addon.version"
            :after="(currentlyUninstalling.indexOf(addon.id) >= 0) ? 'Uninstalling...' : ''"
            :title="addon.label"
          >
            <!-- <f7-swipeout-actions left>
              <f7-swipeout-button v-if="addon.link" color="blue">Documentation</f7-swipeout-button>
              <f7-swipeout-button color="red">Uninstall</f7-swipeout-button>
            </f7-swipeout-actions> -->
            <!-- <f7-icon slot="media" icon="demo-list-icon"></f7-icon> -->
          </f7-list-item>
          <!-- <f7-block-footer slot="after-list">Swipe right for actions.</f7-block-footer> -->
        </f7-list>
      </f7-col>
    </f7-block>
    <f7-block form v-if="!addons.length" class="service-config block-narrow">
      <f7-col>
        <f7-block strong>
          <p>No add-ons of type {{addonType}} installed yet. Click the + button to add one!</p>
        </f7-block>
      </f7-col>
    </f7-block>
    <f7-fab position="right-bottom" slot="fixed" color="blue" href="add">
      <f7-icon ios="f7:plus" md="material:add" aurora="f7:plus"></f7-icon>
      <f7-icon ios="f7:close" md="material:close" aurora="f7:close"></f7-icon>
    </f7-fab>
    <!-- <addon-details-popup
      :addon-id="currentAddonId"
      :opened="addonPopupOpened"
      @closed="addonPopupOpened = false; currentAddonId = null"
    /> -->
    <addon-details-sheet
      :addon-id="currentAddonId"
      :opened="addonPopupOpened"
      @closed="addonPopupOpened = false"
      @uninstall="uninstallAddon"
    />
  </f7-page>
</template>

<script>
// import AddonDetailsPopup from './addon-details-popup.vue'
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
      addonPopupOpened: false,
      currentlyUninstalling: []
    }
  },
  methods: {
    openAddonPopup (addonId) {
      this.currentAddonId = addonId
      this.addonPopupOpened = true
    },
    onPageAfterIn () {
      this.currentlyUninstalling = []
      this.load()
    },
    load () {
      this.$oh.api.get('/rest/extensions').then(data => {
        this.addons = data.filter(addon => addon.installed && addon.type === this.addonType)
        this.startEventSource()
      }).catch((err) => {
        // sometimes we get 502 errors ('Jersey is not ready yet!'), keep trying
        console.log('Error while accessing the API, retrying every 5 seconds: ', err)
        setTimeout(this.load, 5000)
      })
    },
    uninstallAddon (addon) {
      this.addonPopupOpened = false
      this.currentlyUninstalling.push(addon.id)
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
