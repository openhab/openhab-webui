// note: this file is generated and should not be edited by hand

import {
  DirIconsStyle,
  StopIconStyle
} from '../common.gen.ts'

export interface Config {
  title?: string
  footer?: string
  noBorder?: boolean
  noShadow?: boolean
  outline?: boolean
  vertical?: boolean
  item?: string
  dirIconsStyle?: DirIconsStyle
  stopIconStyle?: StopIconStyle
  stateInCenter?: boolean
}
import { guardConfig, guardComponent } from '@/types/widget-ts-template'

export interface Component {
  component: 'oh-rollershutter-card'
  config: Config
}

export const isConfig = (config: unknown): config is Config => {
  return guardConfig<Config>(config)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-rollershutter-card', component as Component, isConfig, defaultConfig)
}

export {
  DirIconsStyle,
  StopIconStyle
}
