import { createI18n, type I18n } from 'vue-i18n'

import { useRuntimeStore } from '@/js/stores/useRuntimeStore'

/**
 * Load locale messages for a specific path and set them in the i18n instance.
 *
 * @param locales Array of locale strings to load.
 * @param group Directory group containint the locale JSON files.
 * @param setLocaleMessage Function to set the loaded locale messages - should be optained from useI18n with either 'local' or 'global' useScope from the setup function
 * @returns Promise that resolves when all messages are loaded.
 */
export async function loadLocaleMessages (dir : string, setLocaleMessage: (locale: string, messages: any) => void) {
  // use set to avoid loading the same locale multiple times
  const localeFiles: Set<string> = new Set([
    useRuntimeStore().locale,
    useRuntimeStore().locale.split('-')[0],
    useRuntimeStore().fallbackLocale,
    useRuntimeStore().fallbackLocale.split('-')[0]
  ])
  const localeFilesArray = Array.from(localeFiles)

  console.log(`Loading locale messages: ${dir} for locales:`, localeFilesArray)

  return Promise.allSettled(
    localeFilesArray.map((locale) => import(`../assets/i18n/${dir}/${locale}.json`))
  ).then((results) => {
    results.forEach((result, index) => {
      const locale = localeFilesArray[index]
      if (result.status === 'fulfilled') {
        setLocaleMessage(locale, { ...result.value.default })
      }
    })
  })
}

export const i18n: I18n = createI18n({
  legacy: false,
  locale: '',         // this will be updated when useRuntimeStore is available
  fallbackLocale: '', // this will be updated when useRuntimeStore is available
  messages: {},
  silentFallbackWarn: true,
  silentTranslationWarn: true,
  globalInjection: true,
  missingWarn: false,
  fallbackRoot: true,
  warnHtmlMessage: false
})

export function isLocaleSupported (locale: string): boolean {
  try {
    new Date().toLocaleDateString(locale)
  } catch (e) {
    return false
  }
  return true
}

export function convertJavaLocale (locale: string): string {
  if (!locale) {
    return 'default'
  }

  let language = ''
  let script = ''
  let region = ''

  // determine country, language and script
  locale.split('_').forEach((segment) => {
    if (segment === segment.toLowerCase() && segment.length === 2) {
      language = segment
    } else if (segment === segment.toUpperCase() && segment.length === 2) {
      region = segment
    } else if (segment.charAt(0) === '#') {
      script = segment.substring(1)
    }
  })

  if (language && script && region) {
    const jsLocale = `${language}-${script}-${region}`
    if (isLocaleSupported(jsLocale)) {
      return jsLocale
    }
  } else if (language && region) {
    const jsLocale = `${language}-${region}`
    if (isLocaleSupported(jsLocale)) {
      return jsLocale
    }
  }

  return 'default'
}
