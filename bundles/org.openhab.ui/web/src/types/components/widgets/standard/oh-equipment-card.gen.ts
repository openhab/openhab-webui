// note: this file is generated and should not be edited by hand

import { guardConfig, guardComponent, type ConfigGuardFn } from '@/types/widget-ts-template'
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
export interface Component {
  component: 'oh-equipment-card'
  config: Config
}

export const isConfig: ConfigGuardFn<Config> = (config: unknown): config is Config => {
  return guardConfig<Config>(config, isConfig.validationFn)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-equipment-card', component, isConfig, defaultConfig)
}

export {
  Item,
  BackgroundColor
}
