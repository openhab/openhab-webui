// note: this file is generated and should not be edited by hand

import {
  ChartType,
  type Period
} from '../common.gen.ts'

export interface Config {
  chartType: ChartType
  period?: Period
  initialWeek?: number
  initialMonth?: string
  initialYear?: number
  future?: number
  formatterMaxDecimalPlaces?: number
  periodVisible?: boolean
  height?: string
}
import { guardConfig, guardComponent } from '@/types/widget-ts-template'

export interface Component {
  component: 'oh-chart'
  config: Config
}

export const isConfig = (config: unknown): config is Config => {
  return guardConfig<Config>(config)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-chart', component as Component, isConfig, defaultConfig)
}

export {
  ChartType,
  type Period
}
