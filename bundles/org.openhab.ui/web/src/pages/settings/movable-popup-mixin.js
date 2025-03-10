import { assign, pick } from 'lodash'

export default {
  data () {
    return {
      movablePopup: {
        movable: false,
        origin: null,
        startPos: null,
        originalStyle: null,
        originalCursor: null,
        popupRef: null,
        draggableRef: null,
        resizeObserver: null
      }
    }
  },
  methods: {
    /**
     * Make the given popupRef movable by dragging the draggableRef element
     * If draggableRef is not provided, the popupRef will be used as the draggable element
     * 
     * This method needs to be called in the popup:open event handler, and
     * cleanupMovablePopup() must be called in the popup:close event handler.
     * 
     * The popupRef must be a reference to the popup element, e.g.
     *   <f7-popup ref="popupRef"
     * And the draggableRef must be a reference to the element that will be used to 
     * drag the popup. This is usually the navbar or the header of the popup. e.g.
     *   <f7-navbar ref="navbar">
     * 
     *   this.initializeMovablePopup(this.$refs.popupRef, this.$refs.navbar)
     * 
     * For usage example, see widget-config-popup.vue, and widget-code-popup.vue.
     * 
     * @param {Object} popupRef - The reference to the popup element
     * @param {Object} [draggableRef] - The reference to the draggable element
     */
    initializeMovablePopup (popupRef, draggableRef = null) {
      if (!popupRef) {
        console.error('popupRef is required')
        return
      }
      this.movablePopup.popupRef = popupRef
      this.movablePopup.draggableRef = draggableRef || popupRef
      this.movablePopup.resizeObserver?.disconnect()
      if (!this.movablePopup.resizeObserver) {
        this.movablePopup.resizeObserver = new ResizeObserver((entries) => {
          // When the window is resized, the popup might switch to full width due to media queries
          // and when that happens, disable movable behavior and restore the original style
          // This callback is called at initialization, so no need to call enableMovablePopup separately
          const entry = entries[0]
          if (entry.target.offsetWidth === entry.target.parentElement.offsetWidth) {
            this.disableMovablePopup()
            const { popupRef, draggableRef, originalStyle, originalCursor } = this.movablePopup
            if (popupRef.$el.parentNode && originalStyle) {
              assign(popupRef.$el.style, originalStyle)
            }
            if (originalCursor !== null) { // check against null, restore the cursor even if it's an empty string
              draggableRef.$el.style.cursor = originalCursor
            }
          } else {
            this.enableMovablePopup()
          }
        })
      }
      this.movablePopup.resizeObserver.observe(popupRef.$el)
    },
    cleanupMovablePopup () {
      this.disableMovablePopup()
      this.movablePopup.resizeObserver?.disconnect()
    },
    enableMovablePopup () {
      if (this.movablePopup.movable) return

      const { popupRef, draggableRef } = this.movablePopup
      this.movablePopup.originalStyle = pick(popupRef.$el.style, ['left', 'top', 'marginLeft', 'marginTop'])
      this.movablePopup.originalCursor = draggableRef.$el.style.cursor
      draggableRef.$el.addEventListener('mousedown', this.movableStart)
      draggableRef.$el.addEventListener('touchstart', this.movableStart)
      draggableRef.$el.style.cursor = 'move'
      this.movablePopup.movable = true
    },
    disableMovablePopup () {
      if (!this.movablePopup.movable) return

      const draggableEl = this.movablePopup.draggableRef.$el
      draggableEl.removeEventListener('mousedown', this.movableStart)
      draggableEl.removeEventListener('touchstart', this.movableStart)
      this.movableEnd()
      this.movablePopup.movable = false
    },
    movableStart (e) {
      if (e instanceof MouseEvent && e.button !== 0) return // only left (primary) mouse button

      const { popupRef, draggableRef } = this.movablePopup
      this.movablePopup.origin = { left: popupRef.$el.offsetLeft, top: popupRef.$el.offsetTop }
      const coords = e.touches ? e.touches[0] : e
      this.movablePopup.startPos = { x: coords.pageX, y: coords.pageY }

      const [moveEvent, endEvent] = e instanceof MouseEvent ? ['mousemove', 'mouseup'] : ['touchmove', 'touchend']
      draggableRef.$el.addEventListener(moveEvent, this.movableMove)
      draggableRef.$el.addEventListener(endEvent, this.movableEnd)
    },
    movableMove (e) {
      const coords = e.touches ? e.touches[0] : e
      const deltaX = coords.pageX - this.movablePopup.startPos.x
      const deltaY = coords.pageY - this.movablePopup.startPos.y
      const popupEl = this.movablePopup.popupRef.$el
      popupEl.style.left = this.movablePopup.origin.left + deltaX + 'px'
      popupEl.style.top = this.movablePopup.origin.top + deltaY + 'px'
      popupEl.style.marginLeft = 0
      popupEl.style.marginTop = 0
    },
    movableEnd (e) {
      const draggableEl = this.movablePopup.draggableRef.$el
      draggableEl.removeEventListener('mousemove', this.movableMove)
      draggableEl.removeEventListener('touchmove', this.movableMove)
      draggableEl.removeEventListener('mouseup', this.movableEnd)
      draggableEl.removeEventListener('touchend', this.movableEnd)
    }
  }
}
