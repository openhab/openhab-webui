// note: this file is generated and should not be edited by hand

import { guardConfig, guardComponent } from '@/types/widget-ts-template'
import {
  Orient
} from '../common.gen.ts'


export interface Config {
  show?: boolean
  orient?: Orient
  confine?: boolean
  smartFormatter?: boolean
}
export interface Component {
  component: 'oh-chart-tooltip'
  config: Config
}

export const isConfig = (config: unknown): config is Config => {
  return guardConfig<Config>(config)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-chart-tooltip', component as Component, isConfig, defaultConfig)
}

export {
  Orient
}
