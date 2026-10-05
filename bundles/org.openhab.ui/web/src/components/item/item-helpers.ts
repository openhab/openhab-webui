import { isSemanticTag, isSemanticMetadata } from '@/components/tags/tag-helpers'
import * as api from '@/api'

export function isGroupItem(item: api.EnrichedItem | api.EnrichedGroupItem | api.GroupItem): item is api.EnrichedGroupItem {
  return item.type === 'Group'
}

export function getItemTypeLabel(item: api.EnrichedItem | api.EnrichedGroupItem | api.GroupItem) {
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

/**
 * Validate the Item name against valid characters and (if existing Items are available on `this.items`) names of existing Items.
 *
 * @param {string} name Item name to validate
 * @param {api.EnrichedItem[] | api.EnrichedGroupItem[] | api.GroupItem[]} [items] Existing items to check for name conflicts
 * @returns {string} The error message if the name is invalid, or an empty string if the name is valid.
 */
export function validateItemName(name: string, items?: api.EnrichedItem[] | api.EnrichedGroupItem[] | api.GroupItem[]) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
    return 'Required. Must not start with a number. A-Z,a-z,0-9,_ only'
  } else if (items && items.some((item) => item.name === name)) {
    return 'An Item with this name already exists'
  }
  return ''
}
