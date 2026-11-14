import { useSemanticsStore } from '@/js/stores/useSemanticsStore'
import type { SemanticMetadata, SemanticTagType } from '@/types/semantic-tags'

export function isSemanticTag(tag: string) {
  return [useSemanticsStore().Locations, useSemanticsStore().Equipment, useSemanticsStore().Points, useSemanticsStore().Properties].some(
    (t) => t.indexOf(tag) >= 0
  )
}

export function semanticType(tag: string) {
  if (useSemanticsStore().Locations.indexOf(tag) >= 0) return 'Location'
  if (useSemanticsStore().Equipment.indexOf(tag) >= 0) return 'Equipment'
  if (useSemanticsStore().Points.indexOf(tag) >= 0) return 'Point'
  if (useSemanticsStore().Properties.indexOf(tag) >= 0) return 'Property'
  return '' as SemanticTagType
}

export function isSemanticMetadata(semanticMetadata: unknown): semanticMetadata is SemanticMetadata {
  return !!semanticMetadata && typeof semanticMetadata === 'object' && 'value' in semanticMetadata
}
