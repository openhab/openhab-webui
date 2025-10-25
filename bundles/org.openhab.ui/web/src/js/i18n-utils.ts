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
