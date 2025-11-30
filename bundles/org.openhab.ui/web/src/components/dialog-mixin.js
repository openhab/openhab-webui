import { getAccessToken } from '@/js/openhab/auth.js'
import { useRuntimeStore } from '@/js/stores/useRuntimeStore.js'

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
        return
      }
      const identifier = localStorage.getItem('openhab.ui:dialog.id') ?? 'anonymous'
      const dialogListeningItem = localStorage.getItem('openhab.ui:dialog.listeningItem') ?? ''
      const dialogLocationItem = localStorage.getItem('openhab.ui:dialog.locationItem') ?? ''
      import('../js/voice/audio-main.js').then(({ AudioMain }) => {
        if (this.audioMain) {
          return
        }
        let port = ''
        if (!((location.protocol === 'https:' && location.port === '443') || (location.protocol === 'http:' && location.port === '80'))) {
          port = `:${location.port}`
        }
        const ohURL = `${location.protocol}//${location.hostname}${port}`
        const updatePageIcon = (online, recording, playing) => {
          let voiceIcon
          if (!online) {
            voiceIcon = 'f7:mic_slash_fill'
          } else if (recording) {
            voiceIcon = 'f7:mic_circle_fill'
          } else if (playing) {
            voiceIcon = 'f7:speaker_2_fill'
          } else {
            voiceIcon = 'f7:mic_circle'
          }
          useRuntimeStore().voiceIcon = voiceIcon
        }
        updatePageIcon(false)
        this.audioMain = new AudioMain(ohURL, getAccessToken, {
          onMessage: (...args) => {
            console.debug('Voice: ' + args[0])
          },
          onRunningChange (io) {
            updatePageIcon(io.isRunning(), io.isListening(), io.isSpeaking())
          },
          onListeningChange (io) {
            updatePageIcon(io.isRunning(), io.isListening(), io.isSpeaking())
          },
          onSpeakingChange (io) {
            updatePageIcon(io.isRunning(), io.isListening(), io.isSpeaking())
          }
        })
        const events = ['touchend', 'mousedown', 'keydown']
        const startAudio = () => {
          clean()
          this.audioMain.initialize(identifier, dialogListeningItem, dialogLocationItem)
        }
        const clean = () => events.forEach((e) => document.body.removeEventListener(e, startAudio))
        events.forEach((e) => document.body.addEventListener(e, startAudio, false))
      })
    },
    triggerDialog () {
      if (this.audioMain != null) {
        this.audioMain.sendSpot()
      }
    }
  }
}
