import reloadMixin from './reload-mixin'

export default {
  mixins: [reloadMixin],
  data () {
    return {
      // For the communication failure toast
      communicationFailureToast: null,
      communicationFailureTimeoutId: null,
      // For the communication failure page
      communicationFailureMsg: null
    }
  },
  methods: {
    /**
     * Creates and opens a toast message that indicates a failure, e.g. of SSE connection
     * @param {string} message message to show
     * @param {boolean} [reloadButton=false] displays a reload button
     * @param {boolean} [autoClose=true] closes toast automatically
     * @returns {Toast.Toast}
     */
    displayFailureToast (message, reloadButton = false, autoClose = true) {
      const toast = this.$f7.toast.create({
        text: message,
        closeButton: reloadButton,
        closeButtonText: this.$t('dialogs.reload'),
        destroyOnClose: autoClose,
        closeTimeout: (autoClose) ? 5000 : undefined,
        cssClass: 'failure-toast button-outline',
        position: 'bottom',
        horizontalPosition: 'center'
      })
      toast.on('closeButtonClick', () => {
        this.reload()
      })
      toast.open()
      return toast
    }
  },
  created () {
    this.checkPurgeServiceWorkerAndCachesAvailable()
  },
  mounted () {
    this.$f7ready((f7) => {
      this.$store.subscribe((mutation, state) => {
        if (this.ready) {
          if (mutation.type === 'sseConnected') {
            if (!window.OHApp && this.$f7) {
              if (mutation.payload === false) {
                if (this.communicationFailureToast === null) {
                  this.communicationFailureTimeoutId = setTimeout(() => {
                    if (this.communicationFailureToast !== null) return
                    this.communicationFailureToast = this.displayFailureToast(this.$t('error.communicationFailure'), true, false)
                    this.communicationFailureToast.open()
                    this.communicationFailureTimeoutId = null
                  }, 1000)
                }
              } else if (mutation.payload === true) {
                if (this.communicationFailureTimeoutId !== null) clearTimeout(this.communicationFailureTimeoutId)
                if (this.communicationFailureToast !== null) {
                  this.communicationFailureToast.close()
                  this.communicationFailureToast.destroy()
                  this.communicationFailureToast = null
                }
              }
            }
          }
        }
      })

      this.$store.subscribeAction({
        error: (action, state, error) => {
          if (action.type === 'sendCommand') {
            let reloadButton = true
            let msg = this.$t('error.communicationFailure')
            switch (error) {
              case 404:
              case 'Not Found':
                msg = this.$t('error.itemNotFound').replace('%s', action.payload.itemName)
                reloadButton = false
                return this.displayFailureToast(msg, reloadButton)
            }
            if (this.communicationFailureToast === null) {
              this.communicationFailureToast = this.displayFailureToast(this.$t('error.communicationFailure'), true, true)
              this.communicationFailureToast.on('closed', () => {
                this.communicationFailureToast = null
              })
            }
          }
        }
      })
    })
  }
}
