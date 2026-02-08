import { ref } from 'vue'
import { getAccessToken } from '@/js/openhab/auth'
import { useRuntimeStore } from '@/js/stores/useRuntimeStore'
import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'
import type { AudioMain } from '@/js/voice/audio-main'

/**
 * Composable for managing the voice dialog.
 */
export function useDialog() {
  const audioMain = ref<AudioMain | null>(null)

  const uiOptionsStore = useUIOptionsStore()
  const runtimeStore = useRuntimeStore()

  const updatePageIcon = (online: boolean, recording: boolean, playing: boolean) => {
    let voiceIcon: string
    if (!online) {
      voiceIcon = 'f7:mic_slash_fill'
    } else if (recording) {
      voiceIcon = 'f7:mic_circle_fill'
    } else if (playing) {
      voiceIcon = 'f7:speaker_2_fill'
    } else {
      voiceIcon = 'f7:mic_circle'
    }
    runtimeStore.voiceIcon = voiceIcon
  }

  /**
   * Starts the audio WebSocket connection if dialog support is enabled.
   */
  const startAudioWebSocket = () => {
    if (audioMain.value) {
      return
    }
    const { dialogEnabled, dialogIdentifier, dialogLocationItem, dialogListeningItem, dialogConnectOnWindowEvent, dialogTriggerOnConnect } =
      uiOptionsStore

    if (!dialogEnabled) {
      return
    }

    import('@/js/voice/audio-main').then(({ AudioMain }) => {
      if (audioMain.value) {
        return
      }
      let port = ''
      if (
        !((location.protocol === 'https:' && location.port === '443') || (location.protocol === 'http:' && location.port === '80')) &&
        location.port.length > 0
      ) {
        port = `:${location.port}`
      }
      const ohURL = `${location.protocol}//${location.hostname}${port}`

      updatePageIcon(false, false, false)
      let forceTrigger = dialogTriggerOnConnect
      audioMain.value = new AudioMain(ohURL, getAccessToken, {
        onMessage: (...args) => {
          console.debug('Voice: ' + args[0])
        },
        onRunningChange(io) {
          updatePageIcon(io.isRunning(), io.isListening(), io.isSpeaking())
          if (forceTrigger && io.isRunning()) {
            forceTrigger = false
            io.sendSpot()
          }
        },
        onListeningChange(io) {
          updatePageIcon(io.isRunning(), io.isListening(), io.isSpeaking())
        },
        onSpeakingChange(io) {
          updatePageIcon(io.isRunning(), io.isListening(), io.isSpeaking())
        }
      })

      if (dialogConnectOnWindowEvent) {
        const events = ['touchend', 'mousedown', 'keydown'] as const
        const startAudio = () => {
          clean()
          if (audioMain.value && !audioMain.value.isInitialized()) {
            audioMain.value.initialize(dialogIdentifier, dialogListeningItem, dialogLocationItem)
          }
        }
        const clean = () => events.forEach((e) => document.body.removeEventListener(e, startAudio))
        events.forEach((e) => document.body.addEventListener(e, startAudio, false))
      }
    })
  }

  /**
   * Triggers the dialog if initialized, otherwise initializes it.
   */
  const triggerDialog = () => {
    if (audioMain.value != null) {
      if (audioMain.value.isInitialized()) {
        audioMain.value.sendSpot()
      } else {
        const { dialogIdentifier, dialogLocationItem, dialogListeningItem } = uiOptionsStore
        audioMain.value.initialize(dialogIdentifier, dialogListeningItem, dialogLocationItem)
      }
    }
  }

  return {
    startAudioWebSocket,
    triggerDialog
  }
}
