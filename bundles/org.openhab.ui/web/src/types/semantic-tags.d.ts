export type SemanticTagType = 'Location' | 'Equipment' | 'Point' | 'Property'
export type SemanticTag = string
export interface SemanticMetadataConfig {
  hasLocation?: string
  isPointOf?: string
  relatesTo?: string
  isPartOf?: string
}

export interface SemanticMetadata {
  value: string
  config?: SemanticMetadataConfig
}
