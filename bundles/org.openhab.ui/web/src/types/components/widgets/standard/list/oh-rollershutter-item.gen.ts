// note: this file is generated and should not be edited by hand

import { guardConfig, guardComponent } from '@/types/widget-ts-template'
import {
  DirIconsStyle,
  StopIconStyle
} from '../../common.gen.ts'


export interface Config {
  title?: string
  subtitle?: string
  after?: string
  icon?: string
  iconColor?: string
  iconUseState?: boolean
  vertical?: boolean
  item?: string
  dirIconsStyle?: DirIconsStyle
  stopIconStyle?: StopIconStyle
  stateInCenter?: boolean
}
export interface Component {
  component: 'oh-rollershutter-item'
  config: Config
}

export const isConfig = (config: unknown): config is Config => {
  return guardConfig<Config>(config)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-rollershutter-item', component as Component, isConfig, defaultConfig)
}

export {
  DirIconsStyle,
  StopIconStyle
}
