// note: this file is generated and should not be edited by hand

import {
  Modules
} from '../../common.gen.ts'

export interface Config {
  title?: string
  subtitle?: string
  after?: string
  icon?: string
  iconColor?: string
  iconUseState?: boolean
  item?: string
  modules?: Modules
}
import { guardConfig, guardComponent } from '@/types/widget-ts-template'

export interface Component {
  component: 'oh-colorpicker-item'
  config: Config
}

export const isConfig = (config: unknown): config is Config => {
  return guardConfig<Config>(config)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-colorpicker-item', component as Component, isConfig, defaultConfig)
}

export {
  Modules
}
