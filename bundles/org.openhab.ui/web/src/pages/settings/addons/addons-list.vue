<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="addonPopupOpened = false" @page:afterout="stopEventSource">
    <f7-navbar :title="'Add-ons: ' + addonsLabels[addonType]" back-link="Settings" back-link-url="/settings/" back-link-force>
      <!-- <f7-nav-right>
        <f7-link href="add">Add</f7-link>
      </f7-nav-right>-->
    </f7-navbar>
    <f7-block form class="service-config block-narrow">
      <f7-col>
        <f7-block-title v-if="!ready">Loading...</f7-block-title>
        <f7-block-title v-else-if="addons.length">{{addons.length}} add-on{{addons.length > 1 ? 's' : ''}} installed</f7-block-title>
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
        <f7-list v-else>
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
    <f7-block form v-if="ready && !addons.length" class="service-config block-narrow">
      <empty-state-placeholder :icon="addonsIcons[addonType]" :title="'No ' + addonsLabels[addonType] + ' installed yet'" text="addons.text" />
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
      v-if="ready"
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
      ready: false,
      currentAddonId: null,
      addonPopupOpened: false,
      currentlyUninstalling: [],
      addonsLabels: {
        binding: 'bindings',
        action: 'actions',
        persistence: 'persistence services',
        transformation: 'transformations',
        misc: 'miscellaneous add-ons',
        ui: 'user interfaces',
        voice: 'voice services'
      },
      addonsIcons: {
        binding: 'circle_grid_hex',
        action: 'bolt_horizontal',
        persistence: 'download_circle',
        transformation: 'function',
        misc: 'rectangle_3_offgrid',
        ui: 'play_rectangle',
        voice: 'chat_bubble_2'
      }
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
        this.ready = true
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
          case 'failed':
            this.$f7.toast.create({
              text: `Uninstallation of add-on ${topicParts[2]} failed`,
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
