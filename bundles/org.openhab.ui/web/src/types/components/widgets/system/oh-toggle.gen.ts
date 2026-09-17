// note: this file is generated and should not be edited by hand

import { guardConfig, guardComponent, type ConfigGuardFn } from '@/types/widget-ts-template'

export interface Config {
  item?: string
  color?: string
  variable?: string
  variableKey?: string
}
export interface Component {
  component: 'oh-toggle'
  config: Config
}

export const isConfig: ConfigGuardFn<Config> = (config: unknown): config is Config => {
  return guardConfig<Config>(config, isConfig.validationFn)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-toggle', component, isConfig, defaultConfig)
}
