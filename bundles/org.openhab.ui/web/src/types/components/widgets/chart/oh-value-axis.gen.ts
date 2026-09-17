// note: this file is generated and should not be edited by hand

import { guardConfig, guardComponent, type ConfigGuardFn } from '@/types/widget-ts-template'
import {
  NameLocation
} from '../common.gen.ts'


export enum Split {
  line = 'line',
  minor = 'minor',
  area = 'area'
}

export interface Config {
  name?: string
  nameLocation?: NameLocation
  nameGap?: number
  nameRotate?: string
  min?: string
  max?: string
  scale?: boolean
  split?: Split[]
  gridIndex?: number
}
export interface Component {
  component: 'oh-value-axis'
  config: Config
}

export const isConfig: ConfigGuardFn<Config> = (config: unknown): config is Config => {
  return guardConfig<Config>(config, isConfig.validationFn)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-value-axis', component, isConfig, defaultConfig)
}

export {
  NameLocation
}
