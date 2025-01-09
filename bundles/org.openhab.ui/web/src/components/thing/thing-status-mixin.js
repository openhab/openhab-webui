import ThingStatusLabels from '@/assets/i18n/thing-status/en'

// Applies to Thing statusInfo.description containing a pattern of
// http(s)://[YOUROPENHAB]:[YOURPORT]/path
const linkRegex = /^(?<pretext>.*)http[^:]*:\/\/[^/]?YOUROPENHAB[^/]?:[^/]?YOURPORT[^/]?\/(?<path>\S+)(?<posttext>.*)$/

export default {
  methods: {
    thingStatusBadgeColor (statusInfo) {
      if (statusInfo.status === 'ONLINE') return 'green'
      if (statusInfo.status === 'OFFLINE') return 'red'
      if (statusInfo.status === 'REMOVING' || statusInfo.status === 'REMOVED') return 'orange'
      if (statusInfo.status === 'INITIALIZING' || statusInfo.status === 'UNKNOWN') return 'yellow'
      return 'gray'
    },
    thingStatusBadgeText (statusInfo) {
      if (statusInfo.statusDetail !== 'NONE') return ThingStatusLabels[statusInfo.statusDetail]
      return statusInfo.status
    },
    thingStatusDescription (statusInfo) {
      const description = statusInfo.description
      if (statusInfo.statusDetail === 'CONFIGURATION_PENDING' && description) {
        const result = linkRegex.exec(description)
        if (result) {
          const { pretext, path, posttext } = result.groups
          if (!path) return description
          const root = location.protocol + '//' + location.host
          return `${pretext}<a href="${root}/${path}" target="_blank" class="link color-blue external">${root}/${path}</a>${posttext}`
        }
      }
      return description
    }
  }
}
