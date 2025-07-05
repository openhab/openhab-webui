import RuleStatusLabels from '@/assets/i18n/rule-status/en'

export default {
  methods: {
    ruleStatusBadgeColor (statusInfo) {
      if (statusInfo?.status === 'IDLE') return 'green'
      if (statusInfo?.statusDetail === 'DISABLED') return 'gray'
      if (statusInfo?.status === 'UNINITIALIZED') return statusInfo.statusDetail === 'TEMPLATE_PENDING' ? 'orange' : 'red'
      if (statusInfo?.status === 'INITIALIZING') return 'yellow'
      if (statusInfo?.status === 'RUNNING') return 'orange'
      return 'green'
    },
    ruleStatusBadgeText (statusInfo) {
      if (!statusInfo?.status) return ''
      if (statusInfo.status === 'IDLE') return 'IDLE'
      if (statusInfo.statusDetail !== 'NONE') return RuleStatusLabels[statusInfo.statusDetail]
      return statusInfo.status
    },
    isRuleStatusDisabled (statusInfo) {
      return statusInfo && statusInfo?.status !== 'IDLE' && statusInfo?.statusDetail === 'DISABLED'
    }
  }
}
