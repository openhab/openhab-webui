// note: this file is generated and should not be edited by hand

import { guardConfig, guardComponent } from '@/types/widget-ts-template'

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
export interface Component {
  component: 'oh-repeater'
  config: Config
}

export const isConfig = (config: unknown): config is Config => {
  return guardConfig<Config>(config)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-repeater', component, isConfig, defaultConfig)
}
