import { f7 } from 'framework7-vue'

const MODAL_OPEN_EVENTS = ['popup:opened', 'sheet:opened', 'popover:opened']
const MODAL_CLOSE_EVENTS = ['popup:close', 'sheet:close', 'popover:close']

export default {
  data() {
    return {
      pageEl: null,
      modalEl: null,
      inForeground: false
    }
  },
  mounted() {
    document.addEventListener('visibilitychange', this.onVisibilityChange)

    const modalEl = this.$el && typeof this.$el.closest === 'function' ? this.$el.closest('.popup, .sheet-modal, .popover') : null

    if (modalEl) {
      this.modalEl = modalEl
      MODAL_OPEN_EVENTS.forEach((evt) => modalEl.addEventListener(evt, this.onModalOpened))
      MODAL_CLOSE_EVENTS.forEach((evt) => modalEl.addEventListener(evt, this.onModalClose))

      const isInOpenModal =
        modalEl.classList.contains('modal-in') || Boolean(this.$el.closest('.framework7-modals') || this.$el.closest('.modal-in'))
      if (isInOpenModal) {
        this.inForeground = true
        this.startForegroundActivity()
      }
      return
    }

    const isInModal =
      this.$el && typeof this.$el.closest === 'function' && (this.$el.closest('.framework7-modals') || this.$el.closest('.modal-in'))
    if (isInModal) {
      this.inForeground = true
      this.startForegroundActivity()
      return
    }

    this.pageEl = this.$el && typeof this.$el.closest === 'function' ? this.$el.closest('.page') : null
    if (this.pageEl && this.pageEl.classList.contains('page-current')) {
      this.inForeground = true
      this.startForegroundActivity()
    }

    f7.on('pageAfterIn', this.onPageAfterIn)
    f7.on('pageBeforeOut', this.onPageBeforeOut)
  },
  beforeUnmount() {
    f7.off('pageAfterIn', this.onPageAfterIn)
    f7.off('pageBeforeOut', this.onPageBeforeOut)
    document.removeEventListener('visibilitychange', this.onVisibilityChange)
    if (this.modalEl) {
      MODAL_OPEN_EVENTS.forEach((evt) => this.modalEl.removeEventListener(evt, this.onModalOpened))
      MODAL_CLOSE_EVENTS.forEach((evt) => this.modalEl.removeEventListener(evt, this.onModalClose))
      this.modalEl = null
    }
    this.inForeground = false
    this.stopForegroundActivity()
  },
  methods: {
    startForegroundActivity() {
      // override this in your widget
    },
    stopForegroundActivity() {
      // override this in your widget
    },
    onModalOpened() {
      if (!this.inForeground) {
        this.inForeground = true
        this.startForegroundActivity()
      }
    },
    onModalClose() {
      if (this.inForeground) {
        this.inForeground = false
        this.stopForegroundActivity()
      }
    },
    onPageAfterIn(page) {
      if (page.el === this.pageEl) {
        this.inForeground = true
        this.startForegroundActivity()
      }
    },
    onPageBeforeOut(page) {
      if (page.el === this.pageEl) {
        this.inForeground = false
        this.stopForegroundActivity()
      }
    },
    onVisibilityChange() {
      if (document.visibilityState === 'visible' && this.inForeground) {
        this.startForegroundActivity()
      } else if (document.visibilityState === 'hidden' && this.inForeground) {
        this.stopForegroundActivity()
      }
    }
  }
}
