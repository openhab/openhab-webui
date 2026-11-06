// note: this file is generated and should not be edited by hand

import {
  Action,
  ActionHttpMethod,
  ActionPageTransition,
  ActionAnalyzerChartType,
  ActionAnalyzerCoordSystem,
  ActionAnalyzerAggregation
} from './common.gen.ts'

export interface ActionConfig {
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
  taphold_action?: Action | Action[]
  taphold_actionUrl?: string
  taphold_actionUrlSameWindow?: boolean
  taphold_actionHttpMethod?: ActionHttpMethod
  taphold_actionHttpBody?: string
  taphold_actionItem?: string
  taphold_actionCommand?: string
  taphold_actionCommandAlt?: string
  taphold_actionOptions?: string
  taphold_actionRule?: string
  taphold_actionRuleContext?: string
  taphold_actionPage?: string
  taphold_actionPageDefineVars?: Record<string, unknown>[]
  taphold_actionPageTransition?: ActionPageTransition
  taphold_actionModal?: string
  taphold_actionModalConfig?: string
  taphold_actionPhotos?: string
  taphold_actionPhotoBrowserConfig?: string
  taphold_actionGroupPopupItem?: string
  taphold_actionAnalyzerItems?: string | string[]
  taphold_actionAnalyzerChartType?: ActionAnalyzerChartType
  taphold_actionAnalyzerCoordSystem?: ActionAnalyzerCoordSystem
  taphold_actionAnalyzerAggregation?: ActionAnalyzerAggregation
  taphold_actionConfirmation?: string
  taphold_actionFeedback?: string
  taphold_actionVariable?: string
  taphold_actionVariableValue?: string
  taphold_actionVariableKey?: string
}
