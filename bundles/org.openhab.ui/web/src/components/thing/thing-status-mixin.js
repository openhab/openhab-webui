import ThingStatusLabels from '@/assets/i18n/thing-status/en'

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
      return statusInfo.description || ThingStatusLabels[statusInfo.statusDetail + '.description']
    }
  }
}
