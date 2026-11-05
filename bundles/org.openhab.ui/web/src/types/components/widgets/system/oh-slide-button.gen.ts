// note: this file is generated and should not be edited by hand

import {
  Action,
  ActionHttpMethod,
  ActionPageTransition,
  ActionAnalyzerChartType,
  ActionAnalyzerCoordSystem,
  ActionAnalyzerAggregation
} from '../common.gen.ts'

export enum Orientation {
  right = 'right',
  left = 'left',
  up = 'up',
  down = 'down'
}

export interface Config {
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
  text?: string
  orientation?: Orientation
  latch?: boolean
  resetAction?: boolean
  stateItem?: string
  stateVariable?: string
  stateOn?: string
  stateOff?: string
  threshold?: number
  resetDelay?: number
  stateTimeout?: number
  actionVariableValueAlt?: string
  color?: string
  colorOff?: string
  colorDragging?: string
  colorUnknown?: string
}

export {
  Action,
  ActionHttpMethod,
  ActionPageTransition,
  ActionAnalyzerChartType,
  ActionAnalyzerCoordSystem,
  ActionAnalyzerAggregation
}
