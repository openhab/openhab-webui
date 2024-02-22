import AddonDetailsSheet from './addon-details-sheet.vue'

export default {
  components: {
    AddonDetailsSheet
  },
  data () {
    if (!this.$f7.data.addonsStore) this.$f7.data.addonsStore = {}
    return {
      addons: this.$f7.data.addonsStore.addons || {},
      currentAddon: null,
      currentAddonId: null,
      currentServiceId: null,
      ready: false,
      initSearchbar: false,
      addonPopupOpened: false,
      currentlyInstalling: [],
      currentlyUninstalling: []
    }
  },
  methods: {
    openAddonPopup (addonId, serviceId, addon) {
      this.currentAddonId = addonId
      this.currentServiceId = serviceId
      if (addon) this.currentAddon = addon
      this.addonPopupOpened = true
    },
    installAddon (addon) {
      this.addonPopupOpened = false
      this.currentlyInstalling.push(addon.uid)
      if (this.currentAddon) this.$set(this.currentAddon, 'pending', 'INSTALL')
    },
    uninstallAddon (addon) {
      this.addonPopupOpened = false
      this.currentlyUninstalling.push(addon.uid)
      if (this.currentAddon) this.$set(this.currentAddon, 'pending', 'UNINSTALL')
    },
    installableAddon (addon) {
      return (addon && (addon.contentType === 'application/vnd.openhab.bundle' || addon.contentType.indexOf('application/vnd.openhab.feature') === 0))
    },
    isInstalling (addon) {
      return this.currentlyInstalling.indexOf(addon.uid) >= 0
    },
    isUninstalling (addon) {
      return this.currentlyUninstalling.indexOf(addon.uid) >= 0
    },
    isPending (addon) {
      return this.isInstalling(addon) || this.isUninstalling(addon)
    },
    resetPending () {
      this.$set(this, 'currentlyInstalling', [])
      this.$set(this, 'currentlyUninstalling', [])
      this.$set(this, 'currentAddon', null)
      this.currentAddonId = null
      this.currentServiceId = null
    },
    startEventSource () {
      this.$f7.data.addonsStore.addons = this.addons
      this.eventSource = this.$oh.sse.connect('/rest/events?topics=openhab/addons/*/*', null, (event) => {
        const topicParts = event.topic.split('/')
        switch (topicParts[3]) {
          case 'installed':
          case 'uninstalled':
            this.stopEventSource()
            this.load()
            this.$f7.emit('addonChange', null)
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
