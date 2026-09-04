// note: this file is generated and should not be edited by hand

import { guardConfig, guardComponent, type ConfigGuardFn } from '@/types/widget-ts-template'

export interface Config {
  notStyled?: boolean
  noCanvasShadow?: boolean
  x?: number
  y?: number
  w?: number | 'auto'
  h?: number | 'auto'
}
export interface Component {
  component: 'oh-canvas-item'
  config: Config
}

export const isConfig: ConfigGuardFn<Config> = (config: unknown): config is Config => {
  return guardConfig<Config>(config, isConfig.validationFn)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-canvas-item', component, isConfig, defaultConfig)
}
