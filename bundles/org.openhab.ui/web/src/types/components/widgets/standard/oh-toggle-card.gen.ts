// note: this file is generated and should not be edited by hand

import { guardConfig, guardComponent } from '@/types/widget-ts-template'

export interface Config {
  title?: string
  footer?: string
  noBorder?: boolean
  noShadow?: boolean
  outline?: boolean
  item?: string
  color?: string
}
export interface Component {
  component: 'oh-toggle-card'
  config: Config
}

export const isConfig = (config: unknown): config is Config => {
  return guardConfig<Config>(config)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-toggle-card', component as Component, isConfig, defaultConfig)
}
