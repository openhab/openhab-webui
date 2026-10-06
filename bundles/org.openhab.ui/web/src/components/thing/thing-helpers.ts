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

/**
 * Validate the Thing ID against valid characters and
 * if existing Things are available on `this.things`,
 * ensures that the Thing UID doesn't match an existing UID.
 *
 * @param {string} uid The Thing UID to validate
 * @param {string} id The Thing ID to validate
 * @param {api.Thing[]} things The list of existing Things to check for UID conflicts
 * @returns {string} The error message if either the ID or the UID are invalid, or an empty string if they are valid.
 */
export function validateThingUID(uid: string, id: string, things: api.Thing[] = []) {
  if (!/^[A-Za-z0-9_][A-Za-z0-9_-]*$/.test(id)) {
    return 'Required. Must not start with a dash. A-Z,a-z,0-9,_,- only'
  } else if (things && things.some((thing) => thing.UID === uid)) {
    return `A Thing with '${uid}' UID already exists`
  }
  return ''
}
