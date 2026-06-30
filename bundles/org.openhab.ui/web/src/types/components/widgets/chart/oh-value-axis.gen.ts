// note: this file is generated and should not be edited by hand

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
import { guardConfig, guardComponent } from '@/types/widget-ts-template'

export interface Component {
  component: 'oh-value-axis'
  config: Config
}

export const isConfig = (config: unknown): config is Config => {
  return guardConfig<Config>(config)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-value-axis', component as Component, isConfig, defaultConfig)
}

export {
  NameLocation
}
