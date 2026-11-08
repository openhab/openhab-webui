import { ref } from 'vue'
import { getAccessToken } from '@/js/openhab/auth'
import { useRuntimeStore } from '@/js/stores/useRuntimeStore'
import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'
import type { AudioMain } from '@/js/voice/audio-main'
import { wakeWordConfig } from '@/js/voice/wakeword/wake-words'

/**
 * Composable for managing the voice dialog.
 */
export function useDialog() {
  const audioMain = ref<AudioMain | null>(null)

  const uiOptionsStore = useUIOptionsStore()
  const runtimeStore = useRuntimeStore()

  const initialize = () => {
    const { dialogIdentifier, dialogListeningItem, dialogLocationItem, dialogWakeWord, dialogWakeWordUrl } = uiOptionsStore
    void audioMain.value?.initialize(
      dialogIdentifier,
      dialogListeningItem,
      dialogLocationItem,
      wakeWordConfig(dialogWakeWord, dialogWakeWordUrl)
    )
  }

  let levelFrame = 0
  const followLevel = () => {
    // rises at once and falls slowly, like the needle of a level meter
    runtimeStore.voiceLevel = Math.max(audioMain.value?.getLevel() ?? 0, runtimeStore.voiceLevel * 0.9)
    levelFrame = requestAnimationFrame(followLevel)
  }

  const updateState = (io: AudioMain) => {
    const state = io.getState()
    runtimeStore.voiceState = state
    runtimeStore.voiceListeningForWakeWord = io.isListeningForWakeWord()
    cancelAnimationFrame(levelFrame)
    runtimeStore.voiceLevel = 0
    if (state === 'listening' || state === 'speaking') {
      levelFrame = requestAnimationFrame(followLevel)
    }
  }

  /**
   * Starts the audio WebSocket connection if dialog support is enabled.
   */
  const startAudioWebSocket = () => {
    if (audioMain.value) {
      return
    }
    const { dialogEnabled, dialogConnectOnWindowEvent, dialogTriggerOnConnect } = uiOptionsStore

    if (!dialogEnabled) {
      return
    }

    void import('@/js/voice/audio-main').then(({ AudioMain }) => {
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

      runtimeStore.voiceState = 'offline'
      let forceTrigger = dialogTriggerOnConnect
      audioMain.value = new AudioMain(ohURL, getAccessToken, {
        onMessage: (message, level) => {
          if (level === 'error') {
            console.error(`Voice: ${message}`)
          } else {
            console.log(`Voice: ${message}`)
          }
        },
        onRunningChange(io) {
          if (forceTrigger && io.isRunning()) {
            forceTrigger = false
            io.sendSpot()
          }
        },
        onStateChange: updateState
      })

      if (dialogConnectOnWindowEvent) {
        const events = ['touchend', 'mousedown', 'keydown'] as const
        const startAudio = () => {
          clean()
          if (audioMain.value && !audioMain.value.isInitialized()) {
            initialize()
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
        initialize()
      }
    }
  }

  return {
    startAudioWebSocket,
    triggerDialog
  }
}
