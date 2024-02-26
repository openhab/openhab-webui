export default {
  data () {
    return {
      dirty: false
    }
  },
  methods: {
    confirmLeaveWithoutSaving (callbackLeave, callbackCancel) {
      this.$f7.dialog.confirm(
        'Do you want to leave this page without saving?',
        'Changes have not been saved',
        callbackLeave,
        callbackCancel
      )
    },
    beforeLeave (router, routeTo, routeFrom, resolve, reject) {
      if (this.dirty) {
        this.confirmLeaveWithoutSaving(
          function () { resolve() },
          function () {
            const { pushStateRoot = '', pushStateSeparator } = router.params
            let url = routeFrom.url
            history.pushState({ 'view_main': { 'url': url } }, '', pushStateRoot + pushStateSeparator + url)
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
        onSuccessCallback()
      }
    }
  }
}
