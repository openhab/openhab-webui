import { getBasicCredentials } from '@/js/openhab/auth'

export type IconType = 'svg' | 'png'

/**
 * Convert a Blob to a data URL.
 * @param blob
 */
function blobToDataURL (blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Failed to read blob as data URL'))
    reader.onload = () => resolve(reader.result as string)
    reader.readAsDataURL(blob)
  })
}

/**
 * Fetch a URL with basic authentication if needed and return the result as a data URL.
 * If basic authentication is not needed, the URL is returned directly.
 * @param url
 */
async function fetchWithAuth (url: string): Promise<string> {
  const creds: any = getBasicCredentials()

  // If no credentials, return the URL (async function wraps it in a Promise)
  if (!creds) return url

  const headers = new Headers({
    Authorization: 'Basic ' + btoa(`${creds.id}:${creds.password}`)
  })

  const resp = await fetch(url, { method: 'GET', headers, credentials: 'include' })

  if (!resp.ok) throw new Error(resp.statusText || resp.status.toString())

  const blob = await resp.blob()
  return blobToDataURL(blob)
}

export default {
  getIcon: (icon: string, format: IconType = 'svg', state?: string, iconSet?: string) => {
    const params = new URLSearchParams({ format, anyFormat: 'true' })
    if (state) params.append('state', state)
    if (iconSet) params.append('iconset', iconSet)

    return fetchWithAuth(`/icon/${icon}?${params.toString()}`)
  },
  getImage: (url: string) => {
    return fetchWithAuth(url)
  }
}
