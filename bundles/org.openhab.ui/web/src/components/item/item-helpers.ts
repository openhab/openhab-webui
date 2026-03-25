import { isSemanticTag, isSemanticMetadata } from '@/components/tags/tag-helpers'
import * as api from '@/api'

export function isGroupItem(item: api.EnrichedItem | api.EnrichedGroupItem): item is api.EnrichedGroupItem {
  return item.type === 'Group'
}

export function getItemTypeLabel(item: api.EnrichedItem | api.EnrichedGroupItem) {
  let ret = item.type

  if (isGroupItem(item) && item.groupType) {
    ret += ` (${item.groupType}`
    if (item.function?.name) {
      ret += `:${item.function.name}`
      if (item.function.params) ret += `(${item.function.params.join(',')})`
    }
    ret += ')'
  }
  return ret
}

export function getItemTypeAndMetaLabel(item: api.EnrichedItem | api.EnrichedGroupItem) {
  let ret = getItemTypeLabel(item)
  const semanticMetadata = item.metadata?.semantics
  if (isSemanticMetadata(semanticMetadata)) {
    ret += ' · '
    const classParts = semanticMetadata.value?.split('_')
    ret += classParts[0]
    if (classParts.length > 1) {
      ret += ' > ' + classParts.pop()
      if (semanticMetadata.config && semanticMetadata.config.relatesTo) {
        const relatesToParts = semanticMetadata.config.relatesTo.split('_')
        if (relatesToParts.length > 1) {
          ret += ' > ' + relatesToParts.pop()
        }
      }
    }
  }
  return ret
}

export function getNonSemanticTags(item: api.EnrichedItem | api.EnrichedGroupItem) {
  if (!item.tags) return []
  return item.tags.filter((t) => !isSemanticTag(t))
}
