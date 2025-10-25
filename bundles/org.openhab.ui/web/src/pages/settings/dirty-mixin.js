import { f7 } from 'framework7-vue'
import { nextTick } from 'vue'

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
      console.info('Checking dirty before leave ...')
      if (this.dirty) {
        this.confirmLeaveWithoutSaving(
          function () { resolve() },
          function () {
            router.allowPageChange = true
            reject()
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
  },
  mounted () {
    void nextTick(() => {
      const pageEl = this.$el
      if (!pageEl) return
      if (!pageEl.classList.contains('page')) return

      // store a wrapped function so `this` inside beforeLeave is the Vue component instance
      pageEl.beforeLeave = (args) => this.beforeLeave(args)
    })
  }
}
