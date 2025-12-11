import { getBasicCredentials } from '@/js/openhab/auth'

function blobToDataURL (blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Failed to read blob as data URL'))
    reader.onload = () => resolve(reader.result)
    reader.readAsDataURL(blob)
  })
}

/**
 * Shared helper to fetch an image if credentials exist,
 * otherwise returns the raw URL.
 */
async function fetchWithAuth (url) {
  const creds = getBasicCredentials()

  // If no credentials, return the URL (async function wraps it in a Promise)
  if (!creds) return url

  const headers = new Headers({
    Authorization: 'Basic ' + btoa(`${creds.id}:${creds.password}`)
  })

  const resp = await fetch(url, { method: 'GET', headers, credentials: 'include' })

  if (!resp.ok) throw new Error(resp.statusText || resp.status)

  const blob = await resp.blob()
  return blobToDataURL(blob)
}

export default {
  getIcon: (icon, format = 'svg', state, iconSet) => {
    const params = new URLSearchParams({ format, anyFormat: 'true' })
    if (state) params.append('state', state)
    if (iconSet) params.append('iconset', iconSet)

    return fetchWithAuth(`/icon/${icon}?${params.toString()}`)
  },

  getImage: (url) => {
    return fetchWithAuth(url)
  }
}
