// note: this file is generated and should not be edited by hand

import {
  Item,
  BackgroundColor
} from '../common.gen.ts'

export interface Config {
  item?: Item
  title?: string
  subtitle?: string
  backgroundColor?: BackgroundColor
  backgroundImage?: string
  invertText?: boolean
}
import { guardConfig, guardComponent } from '@/types/widget-ts-template'

export interface Component {
  component: 'oh-equipment-card'
  config: Config
}

export const isConfig = (config: unknown): config is Config => {
  return guardConfig<Config>(config)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-equipment-card', component as Component, isConfig, defaultConfig)
}

export {
  Item,
  BackgroundColor
}
