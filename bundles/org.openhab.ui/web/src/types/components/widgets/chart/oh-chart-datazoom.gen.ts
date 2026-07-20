// note: this file is generated and should not be edited by hand

import { guardConfig, guardComponent } from '@/types/widget-ts-template'
import {
  Orient
} from '../common.gen.ts'


export enum Type {
  slider = 'slider',
  inside = 'inside'
}

export interface Config {
  type: Type
  show?: boolean
  orient?: Orient
  top?: string
  bottom?: string
  left?: string
  right?: string
  width?: string
  height?: string
}
export interface Component {
  component: 'oh-chart-datazoom'
  config: Config
}

export const isConfig = (config: unknown): config is Config => {
  return guardConfig<Config>(config)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-chart-datazoom', component as Component, isConfig, defaultConfig)
}

export {
  Orient
}
