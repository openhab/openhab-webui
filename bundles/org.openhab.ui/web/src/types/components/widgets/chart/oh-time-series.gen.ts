// note: this file is generated and should not be edited by hand

import { guardConfig, guardComponent } from '@/types/widget-ts-template'
import {
  OffsetUnit,
  Type,
  LabelPosition,
  Action,
  ActionHttpMethod,
  ActionPageTransition,
  ActionAnalyzerChartType,
  ActionAnalyzerCoordSystem,
  ActionAnalyzerAggregation
} from '../common.gen.ts'


export enum Markers {
  avg = 'avg',
  min = 'min',
  max = 'max',
  time = 'time'
}

export interface Config {
  name?: string
  item?: string
  service?: string
  noBoundary?: boolean
  noItemState?: boolean
  displayState?: boolean
  offsetAmount?: number
  offsetUnit?: OffsetUnit
  markers?: Markers[]
  type?: Type
  labelPosition?: LabelPosition
  color?: string
  showSymbol?: boolean
  barBorderRadius?: number
  xAxisIndex?: number
  yAxisIndex?: number
  action?: Action | Action[]
  actionUrl?: string
  actionUrlSameWindow?: boolean
  actionHttpMethod?: ActionHttpMethod
  actionHttpBody?: string
  actionItem?: string
  actionCommand?: string
  actionCommandAlt?: string
  actionOptions?: string
  actionRule?: string
  actionRuleContext?: string
  actionPage?: string
  actionPageDefineVars?: Record<string, unknown>[]
  actionPageTransition?: ActionPageTransition
  actionModal?: string
  actionModalConfig?: string
  actionPhotos?: string
  actionPhotoBrowserConfig?: string
  actionGroupPopupItem?: string
  actionAnalyzerItems?: string | string[]
  actionAnalyzerChartType?: ActionAnalyzerChartType
  actionAnalyzerCoordSystem?: ActionAnalyzerCoordSystem
  actionAnalyzerAggregation?: ActionAnalyzerAggregation
  actionConfirmation?: string
  actionFeedback?: string
  actionVariable?: string
  actionVariableValue?: string
  actionVariableKey?: string
}
export interface Component {
  component: 'oh-time-series'
  config: Config
}

export const isConfig = (config: unknown): config is Config => {
  return guardConfig<Config>(config)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-time-series', component as Component, isConfig, defaultConfig)
}

export {
  OffsetUnit,
  Type,
  LabelPosition,
  Action,
  ActionHttpMethod,
  ActionPageTransition,
  ActionAnalyzerChartType,
  ActionAnalyzerCoordSystem,
  ActionAnalyzerAggregation
}
