// note: this file is generated and should not be edited by hand

import { guardConfig, guardComponent, type ConfigGuardFn } from '@/types/widget-ts-template'
import {
  DirIconsStyle,
  StopIconStyle
} from '../common.gen.ts'


export interface Config {
  item?: string
  dirIconsStyle?: DirIconsStyle
  stopIconStyle?: StopIconStyle
  stateInCenter?: boolean
}
export interface Component {
  component: 'oh-rollershutter'
  config: Config
}

export const isConfig: ConfigGuardFn<Config> = (config: unknown): config is Config => {
  return guardConfig<Config>(config, isConfig.validationFn)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-rollershutter', component, isConfig, defaultConfig)
}

export {
  DirIconsStyle,
  StopIconStyle
}
