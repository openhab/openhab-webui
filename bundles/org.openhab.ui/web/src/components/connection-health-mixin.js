import { watch } from 'vue'
import { f7 } from 'framework7-vue'
import { storeToRefs } from 'pinia'
import { i18n } from '@/js/i18n'

import reloadMixin from './reload-mixin'

import { useStatesStore } from '@/js/stores/useStatesStore'

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
    connectionHealthSetup () {
      const { sseConnected } = storeToRefs(useStatesStore())

      watch(sseConnected, (newValue) => {
        if (newValue === false) {
          if (this.communicationFailureToast === null) {
            this.communicationFailureTimeoutId = setTimeout(() => {
              if (this.communicationFailureToast !== null) return
              this.communicationFailureToast = this.displayFailureToast(
                i18n.global.t('error.communicationFailure'),
                true,
                false
              )
              this.communicationFailureTimeoutId = null
            }, 2000)
          }
        } else if (newValue === true) {
          if (this.communicationFailureTimeoutId !== null) {
            clearTimeout(this.communicationFailureTimeoutId)
          }
          if (this.communicationFailureToast !== null) {
            this.communicationFailureToast.close()
            this.communicationFailureToast = null
          }
        }
      })

      const unsubscribeAction = useStatesStore().$onAction(({
        name,
        store,
        args,
        after,
        onError
      }) => {
        onError((error) => {
          if (name === 'sendCommand') {
            let reloadButton = true
            let msg = i18n.global.t('error.communicationFailure')
            switch (error) {
              case 404:
              case 'Not Found':
                msg = i18n.global.t('error.itemNotFound').replace('%s', args[0])
                reloadButton = false
                return this.displayFailureToast(msg, reloadButton)
            }
            if (this.communicationFailureToast === null) {
              this.communicationFailureToast = this.displayFailureToast(
                i18n.global.t('error.communicationFailure'),
                true,
                true
              )
              this.communicationFailureToast.on('closed', () => {
                this.communicationFailureToast = null
              })
            }
          }
        })
      })
    },
    /**
     * Creates and opens a toast message that indicates a failure, e.g. of SSE connection
     * @param {string} message message to show
     * @param {boolean} [reloadButton=false] displays a reload button
     * @param {boolean} [autoClose=true] closes toast automatically
     * @returns {Toast.Toast}
     */
    displayFailureToast (message, reloadButton = false, autoClose = true) {
      const toast = f7.toast.create({
        text: message,
        closeButton: reloadButton,
        closeButtonText: i18n.global.t('dialogs.reload'),
        destroyOnClose: true,
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
    this.connectionHealthSetup()
  }
}
