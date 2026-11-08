import type { WakeWordConfig } from '../types.ts'

/**
 * The microWakeWord models that Main UI serves from public/res/wakeword: models of the ESPHome model collection, and models
 * trained by the jVoice project.
 */
export const BUILTIN_WAKE_WORDS = [
  { id: 'alexa', label: 'Alexa' },
  { id: 'hey_jarvis', label: 'Hey Jarvis' },
  { id: 'hey_jeeves', label: 'Hey Jeeves' },
  { id: 'hey_mycroft', label: 'Hey Mycroft' },
  { id: 'hey_openhab', label: 'Hey openHAB' }
] as const

/**
 * The wake word setting for a model at a URL of the user's choice.
 */
export const CUSTOM_WAKE_WORD = 'custom'

/**
 * Returns the model to listen for, or undefined when the wake word is off.
 *
 * @param wakeWord the id of a built-in wake word, {@link CUSTOM_WAKE_WORD}, or empty for none
 * @param customManifestUrl URL of the manifest of a custom wake word, relative to Main UI
 */
export function wakeWordConfig(wakeWord: string, customManifestUrl: string): WakeWordConfig | undefined {
  if (wakeWord === CUSTOM_WAKE_WORD) {
    return customManifestUrl ? { manifestUrl: customManifestUrl } : undefined
  }
  if (BUILTIN_WAKE_WORDS.some((builtin) => builtin.id === wakeWord)) {
    return { manifestUrl: `${import.meta.env.BASE_URL}res/wakeword/${wakeWord}.json` }
  }
  return undefined
}
