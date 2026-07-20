// note: this file is generated and should not be edited by hand

import { guardConfig, guardComponent } from '@/types/widget-ts-template'

export interface Config {
  show?: boolean
  text?: string
  subtext?: string
  top?: string
  bottom?: string
  left?: string
  right?: string
  width?: string
  height?: string
}
export interface Component {
  component: 'oh-chart-title'
  config: Config
}

export const isConfig = (config: unknown): config is Config => {
  return guardConfig<Config>(config)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-chart-title', component as Component, isConfig, defaultConfig)
}
