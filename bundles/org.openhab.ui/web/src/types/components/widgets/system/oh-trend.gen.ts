// note: this file is generated and should not be edited by hand

import {
  TrendGradientDirection
} from '../common.gen.ts'

export interface Config {
  trendItem?: string
  trendStrokeWidth?: string
  trendWidth?: string
  trendGradient?: string
  trendGradientDirection?: TrendGradientDirection
  trendSampling?: number
}
import { guardConfig, guardComponent } from '@/types/widget-ts-template'

export interface Component {
  component: 'oh-trend'
  config: Config
}

export const isConfig = (config: unknown): config is Config => {
  return guardConfig<Config>(config)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-trend', component as Component, isConfig, defaultConfig)
}

export {
  TrendGradientDirection
}
