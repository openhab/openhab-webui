// @ts-expect-error-next-line
import RuleStatusLabels from '@/assets/i18n/rule-status/en'
import { type RuleStatusInfo, type EnrichedRule } from '@/api'

import automation_languages from '@/assets/automation-languages'

export function ruleStatusBadgeColor(statusInfo: RuleStatusInfo) {
  if (statusInfo?.status === 'IDLE') return 'green'
  if (statusInfo?.statusDetail === 'DISABLED') return 'gray'
  if (statusInfo?.status === 'UNINITIALIZED') return statusInfo.statusDetail === 'TEMPLATE_PENDING' ? 'orange' : 'red'
  if (statusInfo?.status === 'INITIALIZING') return 'yellow'
  if (statusInfo?.status === 'RUNNING') return 'orange'
  return 'green'
}

export function ruleStatusBadgeText(statusInfo: RuleStatusInfo) {
  if (!statusInfo?.status) return ''
  if (statusInfo.status === 'IDLE') return 'IDLE'
  const _RuleStatusLabels = RuleStatusLabels as Record<string, string>
  if (statusInfo.statusDetail !== 'NONE') return _RuleStatusLabels[statusInfo.statusDetail] ?? ''
  return statusInfo.status
}

export function isRuleStatusDisabled(statusInfo: RuleStatusInfo) {
  return statusInfo && statusInfo?.status !== 'IDLE' && statusInfo?.statusDetail === 'DISABLED'
}

export function getRuleLanguage(rule: EnrichedRule) {
  const action = rule.actions.find((a) => a.configuration?.type)

  // @ts-expect-error-next-line
  let language = (rule.configuration?.sourceType ?? rule.configuration?.type ?? action?.configuration?.type) as string | undefined

  // @ts-expect-error-next-line
  if (action?.configuration?.type === 'application/javascript' && action.configuration?.blockSource) {
    return { name: 'Javascript+Blockly', shortName: 'Blockly', commentChar: '//' }
  }

  if (language && automation_languages[language]) {
    return automation_languages[language]
  }
  return { name: 'YAML', shortName: 'YAML', commentChar: '#' }
}

export function ruleType(rule: EnrichedRule) {
  if (rule.tags?.includes('Script')) return 'Script'
  if (rule.tags?.includes('Scene')) return 'Scene'
  return 'Rule'
}
