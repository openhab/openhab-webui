// note: this file is generated and should not be edited by hand

import { guardConfig, guardComponent, type ConfigGuardFn } from '@/types/widget-ts-template'
import {
  Action,
  ActionHttpMethod,
  ActionPageTransition,
  ActionAnalyzerChartType,
  ActionAnalyzerCoordSystem,
  ActionAnalyzerAggregation
} from '../common.gen.ts'


export interface Config {
  action?: Action | Action[] | string
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
  taphold_action?: Action | Action[] | string
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
  text?: string
  round?: boolean
  large?: boolean
  small?: boolean
  fill?: boolean
  raised?: boolean
  outline?: boolean
  active?: string
  iconF7?: string
  iconMaterial?: string
  iconColor?: string
  iconSize?: number
  tooltip?: string
  variable?: string
  variableKey?: string
  clearVariable?: boolean
  clearVariableKey?: boolean
}
export interface Component {
  component: 'oh-button'
  config: Config
}

export const isConfig: ConfigGuardFn<Config> = (config: unknown): config is Config => {
  return guardConfig<Config>(config, isConfig.validationFn)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-button', component, isConfig, defaultConfig)
}

export {
  Action,
  ActionHttpMethod,
  ActionPageTransition,
  ActionAnalyzerChartType,
  ActionAnalyzerCoordSystem,
  ActionAnalyzerAggregation
}
