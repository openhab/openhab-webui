export default {
  data () {
    return {
      pageEl: null,
      inForeground: false
    }
  },
  mounted () {
    // determine the current page - support: https://caniuse.com/?search=closest
    this.pageEl = this.$el.closest('.page')
    const isPopup = this.$el.closest('.popup') !== null
    // start the foreground activity immediately if the page
    // is already in the foreground when the widget is mounted
    // or is being shown within a popup
    if (this.pageEl.classList.contains('page-current') || isPopup) {
      this.inForeground = true
      this.startForegroundActivity()
    }
    this.$f7.on('pageAfterIn', this.onPageAfterIn)
    this.$f7.on('pageBeforeOut', this.onPageBeforeOut)
  },
  beforeDestroy () {
    this.$f7.off('pageAfterIn', this.onPageAfterIn)
    this.$f7.off('pageBeforeOut', this.onPageBeforeOut)
    this.stopForegroundActivity()
  },
  methods: {
    startForegroundActivity () {
      // overide this in your widget
    },
    stopForegroundActivity () {
      // overide this in your widget
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
