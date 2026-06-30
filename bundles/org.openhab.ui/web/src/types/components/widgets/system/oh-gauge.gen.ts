// note: this file is generated and should not be edited by hand

import {
  GaugeType
} from '../common.gen.ts'

export interface Config {
  item?: string
  min?: number
  max?: number
  type?: GaugeType
  value?: string
  size?: number
  bgColor?: string
  borderBgColor?: string
  borderColor?: string
  borderWidth?: string
  valueText?: string
  valueTextColor?: string
  valueFontSize?: string
  valueFontWeight?: string
  labelText?: string
  labelTextColor?: string
  labelFontSize?: string
  labelFontWeight?: string
}
import { guardConfig, guardComponent } from '@/types/widget-ts-template'

export interface Component {
  component: 'oh-gauge'
  config: Config
}

export const isConfig = (config: unknown): config is Config => {
  return guardConfig<Config>(config)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-gauge', component as Component, isConfig, defaultConfig)
}

export {
  GaugeType
}
