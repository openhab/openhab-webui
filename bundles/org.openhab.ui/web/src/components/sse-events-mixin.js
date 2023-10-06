import OhPopup from './widgets/modals/oh-popup.vue'
import OhSheet from './widgets/modals/oh-sheet.vue'
import OhPopover from './widgets/modals/oh-popover.vue'

export default {
  data () {
    return {
      eventSource: null,
      audioContext: null
    }
  },
  methods: {
    startEventSource () {
      const topicAudio = 'openhab/webaudio/playurl'
      const commandItem = localStorage.getItem('openhab.ui:commandItem')
      const topicCommand = `openhab/items/${commandItem || ''}/command`
      let topics = null
      if (localStorage.getItem('openhab.ui:webaudio.enable') === 'enabled') {
        topics = topicAudio
      }
      if (commandItem) {
        topics = topics ? `${topics},${topicCommand}` : topicCommand
      }
      if (!topics) return
      this.eventSource = this.$oh.sse.connect(`/rest/events?topics=${topics}`, null, (event) => {
        console.debug('Received SSE event: ' + JSON.stringify(event))
        switch (event.topic) {
          case topicAudio:
            const topicParts = event.topic.split('/')
            switch (topicParts[2]) {
              case 'playurl':
                this.playAudioUrl(JSON.parse(event.payload))
                break
            }
            break
          case topicCommand:
            const payload = JSON.parse(event.payload)
            const [command, ...segments] = payload.value.trim().split(/(?<!\\):/)
            const combined = segments.join(':')
            switch (command) {
              case 'navigate':
                this.$f7.views.main.router.navigate(combined)
                break
              case 'popup':
              case 'popover':
              case 'sheet':
                if (combined.indexOf('page:') !== 0 && combined.indexOf('widget:') !== 0 && combined.indexOf('oh-') !== 0) {
                  console.error('Action target is not of the format page:uid or widget:uid or oh-')
                  return
                }
                console.debug(`Opening ${combined} in ${command} modal`)
                let modalRoute = {
                  url: combined + '/' + command,
                  route: {
                  }
                }
                if (command === 'popup') modalRoute.route.popup = { component: OhPopup }
                if (command === 'popover') modalRoute.route.popup = { component: OhPopover }
                if (command === 'sheet') modalRoute.route.popup = { component: OhSheet }
                let modalProps = {
                  props: {
                    uid: combined,
                    modalParams: {}
                  }
                }
                this.closePopups()
                this.$f7.views.main.router.navigate(modalRoute, modalProps)
                break
              case 'close':
                this.closePopups()
                break
              case 'back':
                this.$f7.views.main.router.back()
                break
              case 'reload':
                window.location.reload()
                break
              case 'notification':
                const payload = {
                  text: segments[0],
                  closeOnClick: true,
                  closeButton: true,
                  swipeToClose: true,
                  closeTimeout: 5000
                }
                if (segments.length > 1) {
                  payload.title = segments[1]
                }
                if (segments.length > 2) {
                  payload.subtitle = segments[2]
                }
                if (segments.length > 3) {
                  payload.titleRightText = segments[3]
                }
                if (segments.length > 4) {
                  payload.closeTimeout = parseInt(segments[4])
                }
                this.$f7.notification.create(payload).open()
                break
            }
            break
        }
      })
    },
    stopEventSource () {
      this.$oh.sse.close(this.eventSource)
      this.eventSource = null
    },
    playAudioUrl (audioUrl) {
      try {
        if (!this.audioContext) {
          window.AudioContext = window.AudioContext || window.webkitAudioContext
          if (typeof (window.AudioContext) !== 'undefined') {
            this.audioContext = new AudioContext()
            unlockAudioContext(this.audioContext)
          }
        }
        console.log('Playing audio URL: ' + audioUrl)
        this.$oh.api.getPlain(audioUrl, '', '*/*', 'arraybuffer').then((data) => {
          this.audioContext.decodeAudioData(data, (buffer) => {
            let source = this.audioContext.createBufferSource()
            source.buffer = buffer
            source.connect(this.audioContext.destination)
            source.start(0)
          })
        })
      } catch (e) {
        console.warn('Error while playing audio URL: ' + e.toString())
      }
      // Safari requires a touch event after the stream has started, hence this workaround
      // Credit: https://www.mattmontag.com/web/unlock-web-audio-in-safari-for-ios-and-macos
      function unlockAudioContext (audioContext) {
        if (audioContext.state !== 'suspended') return
        const b = document.body
        const events = ['touchstart', 'touchend', 'mousedown', 'keydown']
        events.forEach(e => b.addEventListener(e, unlock, false))
        function unlock () { audioContext.resume().then(clean) }
        function clean () { events.forEach(e => b.removeEventListener(e, unlock)) }
      }
    },
    closePopups () {
      const popupEl = this.$el.querySelector('.popup')
      if (popupEl) {
        this.$f7.popup.close(popupEl)
      }
      const popoverEl = this.$el.querySelector('.popover')
      if (popoverEl) {
        this.$f7.popover.close(popoverEl)
      }
      const sheetEl = this.$el.querySelector('.sheet-modal')
      if (sheetEl) {
        this.$f7.sheet.close(sheetEl)
      }
    }
  }
}
