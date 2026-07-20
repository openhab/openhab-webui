// note: this file is generated and should not be edited by hand

import { guardConfig, guardComponent } from '@/types/widget-ts-template'
import {
  Modules
} from '../common.gen.ts'


export interface Config {
  title?: string
  footer?: string
  noBorder?: boolean
  noShadow?: boolean
  outline?: boolean
  item?: string
  modules?: Modules
}
export interface Component {
  component: 'oh-colorpicker-card'
  config: Config
}

export const isConfig = (config: unknown): config is Config => {
  return guardConfig<Config>(config)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-colorpicker-card', component as Component, isConfig, defaultConfig)
}

export {
  Modules
}
