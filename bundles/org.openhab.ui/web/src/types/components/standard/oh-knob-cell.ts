import {
  CircleShape,
  LineCap,
  HandleShape,
  Action,
  ActionHttpMethod,
  ActionPageTransition,
  ActionAnalyzerChartType,
  ActionAnalyzerCoordSystem,
  ActionAnalyzerAggregation
} from '../common.ts'

export interface Config {
  header?: string
  title?: string
  subtitle?: string
  footer?: string
  icon?: string
  color?: string
  on?: string
  item?: string
  min?: number
  max?: number
  step?: number
  offset?: number
  ignoreDisplayState?: boolean
  releaseOnly?: boolean
  commandInterval?: number
  delayStateDisplay?: number
  disabled?: boolean
  size?: number
  responsive?: boolean
  strokeWidth?: number
  startAngle?: number
  endAngle?: number
  circleShape?: CircleShape
  lineCap?: LineCap
  dottedPath?: string
  borderWidth?: number
  handleSize?: string
  handleShape?: HandleShape
  borderColor?: string
  pathColor?: string
  rangeColor?: string
  tooltipColor?: string
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
  actionAnalyzerItems: string
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
  CircleShape,
  LineCap,
  HandleShape,
  Action,
  ActionHttpMethod,
  ActionPageTransition,
  ActionAnalyzerChartType,
  ActionAnalyzerCoordSystem,
  ActionAnalyzerAggregation
}
