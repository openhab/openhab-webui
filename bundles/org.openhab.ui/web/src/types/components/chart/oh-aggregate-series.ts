import {
  OffsetUnit,
  Type,
  AggregationFunction,
  Action,
  ActionHttpMethod,
  ActionPageTransition,
  ActionAnalyzerChartType,
  ActionAnalyzerCoordSystem,
  ActionAnalyzerAggregation
} from '../common.ts'

export enum Markers {
  avg = 'avg',
  min = 'min',
  max = 'max'
}

export enum Dimension {
  minute = 'minute',
  hour = 'hour',
  isoWeekday = 'isoWeekday',
  weekday = 'weekday',
  date = 'date',
  month = 'month'
}

export interface Config {
  name?: string
  item?: string
  service?: string
  noBoundary?: boolean
  noItemState?: boolean
  offsetAmount?: number
  offsetUnit?: OffsetUnit
  markers?: Markers[]
  type?: Type
  dimension1?: Dimension
  dimension2?: Dimension
  transpose?: boolean
  aggregationFunction?: AggregationFunction
  xAxisIndex?: number
  yAxisIndex?: number
  action?: Action
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

export {
  OffsetUnit,
  Type,
  AggregationFunction,
  Action,
  ActionHttpMethod,
  ActionPageTransition,
  ActionAnalyzerChartType,
  ActionAnalyzerCoordSystem,
  ActionAnalyzerAggregation
}
