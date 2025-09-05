import { f7 } from 'framework7-vue'

export default {
  data () {
    return {
      dirty: false
    }
  },
  computed: {
    dirtyIndicator () {
      if (this.dirty) {
        return ' ●' // &#9679;
      }
      return ''
    }
  },
  methods: {
    confirmLeaveWithoutSaving (callbackLeave, callbackCancel) {
      f7.dialog.confirm(
        'Do you want to leave this page without saving?',
        'Changes have not been saved',
        callbackLeave,
        callbackCancel
      )
    },
    beforeLeave ({ resolve, reject, router, from }) {
      if (this.dirty) {
        this.confirmLeaveWithoutSaving(
          function () { resolve() },
          function () {
            const { pushStateRoot = '', pushStateSeparator } = router.params
            let url = from.url
            history.pushState({ view_main: { url } }, '', pushStateRoot + pushStateSeparator + url)
            reject()
            router.allowPageChange = true
          }
        )
      } else {
        resolve()
      }
    },
    switchTab (tab, onSuccessCallback) {
      if (this.currentTab !== tab) {
        this.currentTab = tab
        if (onSuccessCallback) {
          onSuccessCallback()
        }
      }
    }
  }
}
