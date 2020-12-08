
import Vue from 'vue'
import VueI18n from 'vue-i18n'

Vue.use(VueI18n)

export function loadLocaleMessages (locales) {
  const messages = {}
  locales.keys().forEach(key => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i)
    if (matched && matched.length > 1) {
      console.debug('loading i18n messages from: ' + key)
      const locale = matched[1]
      messages[locale] = locales(key)
    }
  })
  return messages
}

export default new VueI18n({
  locale: process.env.VUE_APP_I18N_LOCALE || 'en',
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'en',
  messages: loadLocaleMessages(require.context('@/assets/i18n/common'))
})
