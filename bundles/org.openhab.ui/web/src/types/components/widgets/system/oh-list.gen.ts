// note: this file is generated and should not be edited by hand

import { guardConfig, guardComponent } from '@/types/widget-ts-template'

export interface Config {
  simpleList?: boolean
  mediaList?: boolean
  accordionList?: boolean
}
export interface Component {
  component: 'oh-list'
  config: Config
}

export const isConfig = (config: unknown): config is Config => {
  return guardConfig<Config>(config)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-list', component as Component, isConfig, defaultConfig)
}
