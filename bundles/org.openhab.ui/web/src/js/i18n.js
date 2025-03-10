import Vue from 'vue'
import VueI18n from 'vue-i18n'

Vue.use(VueI18n)

export function loadLocaleMessages (...scopes) {
  const messages = {}
  scopes.forEach(scope => {
    scope.keys().forEach(key => {
      const matched = key.match(/([A-Za-z0-9-_]+)\./i)
      if (matched && matched.length > 1) {
        console.debug('loading i18n messages from: ' + key)
        const locale = matched[1]
        messages[locale] = { ...messages[locale], ...scope(key) }
      }
    })
  })
  return messages
}

export default new VueI18n({
  locale: process.env.VUE_APP_I18N_LOCALE || 'en',
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'en',
  messages: loadLocaleMessages(require.context('@/assets/i18n/common')),
  silentFallbackWarn: true
})

export function isLocaleSupported (locale) {
  try {
    new Date().toLocaleDateString(locale)
  } catch (e) {
    return false
  }
  return true
}

export function convertJavaLocale (locale) {
  if (!locale) {
    return 'default'
  }

  let language = ''
  let script = ''
  let region = ''

  // determine country, language and script
  locale.split('_').forEach(segment => {
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
