/**
 * UI translation (i18n) notes
 *
 * - useRuntimeStore().local is the primary method to update the regionalisation locale.
 * - App.vue: in this.loadData (), the local is set with the setRootResources
 * - App.vue: watches useRuntimeStore().local will load the appropriate global locale messages and set the i18n locale setting appropriately
 * - Global translations are accessible through $t or this.$t in any component without additional setup in the component
 * - For local translations, dereference and use the mergeLocaleMessages and t from the useI18n composable in the setup function with the useScope: 'local'
 * - the mergeLocaleMessages function should be passed to the loadLocaleMessages as a parameter
 * - Message files are bundled into the build with Vite's import.meta.glob
 */
import { createI18n, type I18n } from 'vue-i18n'

import { useRuntimeStore } from '@/js/stores/useRuntimeStore'

const fallbackLocale = import.meta.env.VUE_APP_I18N_FALLBACK_LOCALE || 'en'

const localeFilesGlob = import.meta.glob('../assets/i18n/**/*.json', { import: 'default' })

/**
 * Load locale messages for a specific path and set them in the i18n instance.
 *
 * @param dir Directory group containing the locale JSON files.
 * @param mergeLocaleMessage Function to merge the loaded locale messages - should be obtained from useI18n with either 'local' or 'global' useScope from the setup function
 * @returns Promise that resolves when all messages are loaded.
 */
export async function loadLocaleMessages(dir: string, mergeLocaleMessage: (locale: string, messages: any) => void): Promise<void> {
  // use set to avoid loading the same locale multiple times
  const localeFiles: Set<string> = new Set([
    useRuntimeStore().locale,
    useRuntimeStore().locale.split('-')[0] || '',
    fallbackLocale,
    fallbackLocale.split('-')[0] || ''
  ])
  const localeFilesArray = Array.from(localeFiles)

  const results = await Promise.allSettled(
    localeFilesArray.map(async (locale): Promise<unknown> => {
      const path = `../assets/i18n/${dir}/${locale}.json`
      const loader = localeFilesGlob[path]
      if (loader) {
        return loader()
      } else {
        throw new Error(`Locale file not found: ${path}`)
      }
    })
  )

  results.forEach((result, index) => {
    const locale = localeFilesArray[index]
    if (locale !== undefined && result.status === 'fulfilled') {
      const messages = result.value
      if (messages && typeof messages === 'object') {
        mergeLocaleMessage(locale, { ...(messages as Record<string, unknown>) })
      }
    }
  })
}

export const i18n: I18n = createI18n({
  legacy: false,
  locale: '', // this will be updated when useRuntimeStore is available
  fallbackLocale, // set here so it is set even if REST API connection completely fails and useRuntimeStore is not available
  fallbackWarn: false,
  missingWarn: false,
  globalInjection: true,
  fallbackRoot: true,
  warnHtmlMessage: false
})
