// note: this file is generated and should not be edited by hand

import {
  Orient
} from '../common.gen.ts'

export interface Config {
  show?: boolean
  orient?: Orient
  top?: string
  bottom?: string
  left?: string
  right?: string
  width?: string
  height?: string
}
import { guardConfig, guardComponent } from '@/types/widget-ts-template'

export interface Component {
  component: 'oh-chart-legend'
  config: Config
}

export const isConfig = (config: unknown): config is Config => {
  return guardConfig<Config>(config)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-chart-legend', component as Component, isConfig, defaultConfig)
}

export {
  Orient
}
