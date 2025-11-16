import {
  Action,
  ActionHttpMethod,
  ActionPageTransition,
  ActionAnalyzerChartType,
  ActionAnalyzerCoordSystem,
  ActionAnalyzerAggregation,
  Taphold_action,
  Taphold_actionHttpMethod,
  Taphold_actionPageTransition,
  Taphold_actionAnalyzerChartType,
  Taphold_actionAnalyzerCoordSystem,
  Taphold_actionAnalyzerAggregation
} from '../common.ts'

export interface Config {
  title?: string
  footer?: string
  noBorder?: boolean
  noShadow?: boolean
  outline?: boolean
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
  taphold_action?: Taphold_action
  taphold_actionUrl?: string
  taphold_actionUrlSameWindow?: boolean
  taphold_actionHttpMethod?: Taphold_actionHttpMethod
  taphold_actionHttpBody?: string
  taphold_actionItem?: string
  taphold_actionCommand?: string
  taphold_actionCommandAlt?: string
  taphold_actionOptions?: string
  taphold_actionRule?: string
  taphold_actionRuleContext?: string
  taphold_actionPage?: string
  taphold_actionPageTransition?: Taphold_actionPageTransition
  taphold_actionModal?: string
  taphold_actionModalConfig?: string
  taphold_actionPhotos?: string
  taphold_actionPhotoBrowserConfig?: string
  taphold_actionGroupPopupItem?: string
  taphold_actionAnalyzerItems: string
  taphold_actionAnalyzerChartType?: Taphold_actionAnalyzerChartType
  taphold_actionAnalyzerCoordSystem?: Taphold_actionAnalyzerCoordSystem
  taphold_actionAnalyzerAggregation?: Taphold_actionAnalyzerAggregation
  taphold_actionConfirmation?: string
  taphold_actionFeedback?: string
  taphold_actionVariable?: string
  taphold_actionVariableValue?: string
  taphold_actionVariableKey?: string
}

export {
  Action,
  ActionHttpMethod,
  ActionPageTransition,
  ActionAnalyzerChartType,
  ActionAnalyzerCoordSystem,
  ActionAnalyzerAggregation,
  Taphold_action,
  Taphold_actionHttpMethod,
  Taphold_actionPageTransition,
  Taphold_actionAnalyzerChartType,
  Taphold_actionAnalyzerCoordSystem,
  Taphold_actionAnalyzerAggregation
}
