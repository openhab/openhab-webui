// note: this file is generated and should not be edited by hand

import { guardConfig, guardComponent } from '@/types/widget-ts-template'
import {
  Orient
} from '../common.gen.ts'


export enum Type {
  continuous = 'continuous',
  piecewise = 'piecewise'
}

export enum PresetPalette {
  yellowred = 'yellowred',
  greenred = 'greenred',
  whiteblue = 'whiteblue',
  bluered = 'bluered'
}

export interface Config {
  show?: boolean
  min?: string
  max?: string
  type?: Type
  orient?: Orient
  calculable?: boolean
  pieces?: number
  presetPalette?: PresetPalette
  top?: string
  bottom?: string
  left?: string
  right?: string
  width?: string
  height?: string
}
export interface Component {
  component: 'oh-chart-visualmap'
  config: Config
}

export const isConfig = (config: unknown): config is Config => {
  return guardConfig<Config>(config)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-chart-visualmap', component, isConfig, defaultConfig)
}

export {
  Orient
}
