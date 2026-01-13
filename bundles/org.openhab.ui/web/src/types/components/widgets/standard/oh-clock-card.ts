// note: this file is generated and should not be edited by hand

import {
  Action,
  ActionHttpMethod,
  ActionPageTransition,
  ActionAnalyzerChartType,
  ActionAnalyzerCoordSystem,
  ActionAnalyzerAggregation
} from '../common.ts'

export enum TimeFormat {
  LTS = 'LTS',
  LT = 'LT',
  HH_mm_ss = 'HH:mm:ss'
}

export enum DateFormat {
  LL = 'LL',
  L = 'L',
  MM_DD_YYYY = 'MM/DD/YYYY'
}

export enum DatePos {
  above = 'above',
  below = 'below'
}

export interface Config {
  title?: string
  footer?: string
  noBorder?: boolean
  noShadow?: boolean
  outline?: boolean
  timeFormat?: TimeFormat
  timeFontSize?: string
  timeFontWeight?: string
  showDate?: boolean
  dateFormat?: DateFormat
  datePos?: DatePos
  dateFontSize?: string
  dateFontWeight?: string
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
