export enum SourceType {
  array = 'array',
  range = 'range',
  itemsInGroup = 'itemsInGroup',
  itemsWithTags = 'itemsWithTags',
  itemStateOptions = 'itemStateOptions',
  itemCommandOptions = 'itemCommandOptions',
  rulesWithTags = 'rulesWithTags'
}

export interface Config {
  for?: string
  sourceType?: SourceType
  in?: string
  rangeStart?: number
  rangeStop?: number
  rangeStep?: number
  groupItem?: string
  itemTags?: string
  ruleTags?: string
  itemOptions?: string
  fetchMetadata?: string
  filter?: string
  map?: string
  listContainer?: boolean
  containerClasses?: string
  containerStyle?: string
  fragment?: boolean
  cacheSource?: boolean
}
