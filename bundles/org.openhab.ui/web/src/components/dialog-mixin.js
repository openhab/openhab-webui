export default {
  data () {
    return {
      audioMain: null
    }
  },
  methods: {
    startAudioWebSocket () {
      if (this.audioMain) {
        return
      }
      const dialogEnabled = localStorage.getItem('openhab.ui:dialog.enabled') === 'true'
      if (!dialogEnabled) {
        console.warn('CHECK audio not enabled')
        return
      }
      const identifier = localStorage.getItem('openhab.ui:dialog.id') ?? 'anonymous'
      const dialogListeningItem = localStorage.getItem('openhab.ui:dialog.listeningItem') ?? ''
      const dialogLocationItem = localStorage.getItem('openhab.ui:dialog.locationItem') ?? ''
      const dialogKeywordThreshold = Number(localStorage.getItem('openhab.ui:dialog.keyword.threshold') ?? '0.75')
      const dialogKeywordMinScores = Number(localStorage.getItem('openhab.ui:dialog.keyword.minScores') ?? '5')
      import('../js/voice/audio-main.js').then(({ AudioMain }) => {
        if (this.audioMain) {
          return
        }
        let port = ''
        if (!((location.protocol === 'https:' && location.port === '443') || (location.protocol === 'http:' && location.port === '80'))) {
          port = `:${location.port}`
        }
        const ohURL = `${location.protocol}//${location.hostname}${port}`
        this.audioMain = new AudioMain(ohURL, {
          onMessage: (...args) => {
            console.warn('MESSAGE: ' + args[0])
          },
          onRunningChange (io) {
            console.warn('CHECK ONLINE: ' + io.isRunning())
          },
          onListeningChange (io) {
            console.warn('CHECK LISTENING: ' + io.isListening())
          },
          onSpeakingChange (io) {
            console.warn('CHECK SPEAKING: ' + io.isSpeaking())
          }
        })
        const events = ['touchstart', 'touchend', 'mousedown', 'keydown']
        const startAudio = () => {
          clean()
          this.audioMain.initialize(identifier, dialogListeningItem, dialogLocationItem, { threshold: dialogKeywordThreshold, minScores: dialogKeywordMinScores })
        }
        const clean = () => events.forEach(e => document.body.removeEventListener(e, startAudio))
        events.forEach(e => document.body.addEventListener(e, startAudio, false))
      })
    },
    stopAudioWebSocket () {
      // TODO
      this.audioMain.close()
      this.audioMain = null
    },
    triggerDialog () {
      if (this.audioMain != null) {
        this.audioMain.sendSpot()
      }
    }
  }
}
