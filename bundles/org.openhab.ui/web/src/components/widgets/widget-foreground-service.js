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

    this.$f7.on('pageAfterIn', this.onPageAfterIn)
    this.$f7.on('pageBeforeOut', this.onPageBeforeOut)

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.startForegroundActivity()
      } else if (document.visibilityState === 'hidden') {
        this.stopForegroundActivity()
      }
    })
  },
  beforeDestroy () {
    this.$f7.off('pageAfterIn', this.onPageAfterIn)
    this.$f7.off('pageBeforeOut', this.onPageBeforeOut)
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
    }
  }
}
