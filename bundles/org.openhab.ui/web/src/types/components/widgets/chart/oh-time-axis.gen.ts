// note: this file is generated and should not be edited by hand

import { guardConfig, guardComponent, type ConfigGuardFn } from '@/types/widget-ts-template'
import {
  NameLocation,
  Style
} from '../common.gen.ts'


export interface Config {
  name?: string
  nameLocation?: NameLocation
  nameGap?: number
  nameRotate?: string
  style?: Style
  gridIndex?: number
}
export interface Component {
  component: 'oh-time-axis'
  config: Config
}

export const isConfig: ConfigGuardFn<Config> = (config: unknown): config is Config => {
  return guardConfig<Config>(config, isConfig.validationFn)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-time-axis', component, isConfig, defaultConfig)
}

export {
  NameLocation,
  Style
}
