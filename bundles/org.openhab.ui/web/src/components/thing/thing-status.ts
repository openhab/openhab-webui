import ThingStatusLabels from '@/assets/i18n/thing-status/en.json'
import * as api from '@/api'

// Applies to Thing statusInfo.description containing a pattern of
// http(s)://[YOUROPENHAB]:[YOURPORT]/path
const linkRegex = /^(?<pretext>.*)http[^:]*:\/\/[^/]?YOUROPENHAB[^/]?:[^/]?YOURPORT[^/]?\/(?<path>\S+)(?<posttext>.*)$/

export function thingStatusBadgeColor(statusInfo: api.ThingStatusInfo) {
  if (statusInfo.status === 'ONLINE') return 'green'
  if (statusInfo.status === 'OFFLINE') return 'red'
  if (statusInfo.status === 'REMOVING' || statusInfo.status === 'REMOVED') return 'orange'
  if (statusInfo.status === 'INITIALIZING' || statusInfo.status === 'UNKNOWN') return 'yellow'
  return 'gray'
}

export function thingStatusBadgeText(statusInfo: api.ThingStatusInfo) {
  if (statusInfo.statusDetail !== 'NONE')
    return ThingStatusLabels[statusInfo.statusDetail as keyof typeof ThingStatusLabels] || statusInfo.statusDetail
  return statusInfo.status
}

export function thingStatusDescription(statusInfo: api.ThingStatusInfo) {
  const description = statusInfo.description
  if (description) {
    const result = linkRegex.exec(description)
    if (result) {
      const { pretext, path, posttext } = result.groups as { pretext: string; path: string; posttext: string }
      if (!path) return description
      const root = location.protocol + '//' + location.host
      return `${pretext}<a href="${root}/${path}" target="_blank" class="link color-blue external">${root}/${path}</a>${posttext}`
    }
  }
  return description
}
