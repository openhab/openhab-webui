// note: this file is generated and should not be edited by hand

import { guardConfig, guardComponent, type ConfigGuardFn } from '@/types/widget-ts-template'

export enum VisibleTo {
  role_administrator = 'role:administrator',
  role_user = 'role:user'
}

export interface Config {
  layerName?: string
  preload?: boolean
  visible?: string
  visibleTo?: VisibleTo
}
export interface Component {
  component: 'oh-canvas-layer'
  config: Config
}

export const isConfig: ConfigGuardFn<Config> = (config: unknown): config is Config => {
  return guardConfig<Config>(config, isConfig.validationFn)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-canvas-layer', component, isConfig, defaultConfig)
}
