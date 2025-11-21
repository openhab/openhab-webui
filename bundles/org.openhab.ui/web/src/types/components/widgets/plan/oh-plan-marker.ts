// note: this file is generated and should not be edited by hand

import {
  Action,
  ActionHttpMethod,
  ActionPageTransition,
  ActionAnalyzerChartType,
  ActionAnalyzerCoordSystem,
  ActionAnalyzerAggregation
} from '../common.ts'

export enum TooltipDirection {
  top = 'top',
  bottom = 'bottom',
  left = 'left',
  right = 'right',
  center = 'center',
  auto = 'auto'
}

export interface Config {
  name?: string
  coords?: string
  item?: string
  visible?: string
  icon?: string
  iconUseState?: boolean
  iconSize?: number
  iconWidth?: number
  iconHeight?: number
  iconColor?: string
  iconRotation?: number
  tooltip?: string
  tooltipPermanent?: boolean
  useTooltipAsLabel?: boolean
  tooltipFontSize?: string
  tooltipColor?: string
  tooltipDirection?: TooltipDirection
  tooltipOffsetX?: number
  tooltipOffsetY?: number
  tooltipOpacity?: number
  zoomVisibilityMin?: number
  zoomVisibilityMax?: number
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
  Action,
  ActionHttpMethod,
  ActionPageTransition,
  ActionAnalyzerChartType,
  ActionAnalyzerCoordSystem,
  ActionAnalyzerAggregation
}
