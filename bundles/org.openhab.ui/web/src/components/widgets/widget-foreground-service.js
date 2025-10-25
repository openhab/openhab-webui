import { f7 } from 'framework7-vue'

export default {
  data () {
    return {
      pageEl: null,
      inForeground: false
    }
  },
  mounted () {
    const isInModal = this.$el.closest('.framework7-modals') || this.$el.closest('.modal-in')
    if (isInModal) {
      this.inForeground = true
      this.startForegroundActivity()
      return
    }

    this.pageEl = this.$el.closest('.page')
    if (this.pageEl && this.pageEl.classList.contains('page-current')) {
      this.inForeground = true
      this.startForegroundActivity()
    }

    f7.on('pageAfterIn', this.onPageAfterIn)
    f7.on('pageBeforeOut', this.onPageBeforeOut)
    document.addEventListener('visibilitychange', this.onVisibilityChange)
  },
  beforeUnmount () {
    f7.off('pageAfterIn', this.onPageAfterIn)
    f7.off('pageBeforeOut', this.onPageBeforeOut)
    document.removeEventListener('visibilitychange', this.onVisibilityChange)
    this.inForeground = false
    this.stopForegroundActivity()
  },
  methods: {
    startForegroundActivity () {
      // override this in your widget
    },
    stopForegroundActivity () {
      // override this in your widget
    },
    onPageAfterIn (page) {
      if (page.el === this.pageEl) {
        this.inForeground = true
        this.startForegroundActivity()
      }
    },
    onPageBeforeOut (page) {
      if (page.el === this.pageEl) {
        this.inForeground = false
        this.stopForegroundActivity()
      }
    },
    onVisibilityChange () {
      if (document.visibilityState === 'visible' && this.inForeground) {
        this.startForegroundActivity()
      } else if (document.visibilityState === 'hidden' && this.inForeground) {
        this.stopForegroundActivity()
      }
    }
  }
}
