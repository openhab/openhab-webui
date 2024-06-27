import RuleStatusLabels from '@/assets/i18n/rule-status/en'

export default {
  methods: {
    ruleStatusBadgeColor (statusInfo) {
      if (statusInfo.status === 'IDLE') return 'green'
      if (statusInfo.statusDetail === 'DISABLED') return 'gray'
      if (statusInfo.status === 'UNINITIALIZED') return 'red'
      if (statusInfo.status === 'INITIALIZING') return 'yellow'
      if (statusInfo.status === 'RUNNING') return 'orange'
      return 'green'
    },
    ruleStatusBadgeText (statusInfo) {
      if (statusInfo.status === 'IDLE') return 'IDLE'
      if (statusInfo.statusDetail !== 'NONE') return RuleStatusLabels[statusInfo.statusDetail]
      return statusInfo.status
    }
  }
}
