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


export enum Orientation {
  right = 'right',
  left = 'left',
  up = 'up',
  down = 'down'
}

export enum Color {
  red = 'red',
  green = 'green',
  blue = 'blue',
  pink = 'pink',
  yellow = 'yellow',
  orange = 'orange',
  purple = 'purple',
  deeppurple = 'deeppurple',
  lightblue = 'lightblue',
  teal = 'teal',
  lime = 'lime',
  deeporange = 'deeporange',
  gray = 'gray',
  white = 'white',
  black = 'black'
}

export enum ColorOff {
  red = 'red',
  green = 'green',
  blue = 'blue',
  pink = 'pink',
  yellow = 'yellow',
  orange = 'orange',
  purple = 'purple',
  deeppurple = 'deeppurple',
  lightblue = 'lightblue',
  teal = 'teal',
  lime = 'lime',
  deeporange = 'deeporange',
  gray = 'gray',
  white = 'white',
  black = 'black'
}

export enum ColorDragging {
  red = 'red',
  green = 'green',
  blue = 'blue',
  pink = 'pink',
  yellow = 'yellow',
  orange = 'orange',
  purple = 'purple',
  deeppurple = 'deeppurple',
  lightblue = 'lightblue',
  teal = 'teal',
  lime = 'lime',
  deeporange = 'deeporange',
  gray = 'gray',
  white = 'white',
  black = 'black'
}

export enum ColorUnknown {
  red = 'red',
  green = 'green',
  blue = 'blue',
  pink = 'pink',
  yellow = 'yellow',
  orange = 'orange',
  purple = 'purple',
  deeppurple = 'deeppurple',
  lightblue = 'lightblue',
  teal = 'teal',
  lime = 'lime',
  deeporange = 'deeporange',
  gray = 'gray',
  white = 'white',
  black = 'black'
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
  thumbAspectRatio?: number
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
  color?: Color
  colorOff?: ColorOff
  colorDragging?: ColorDragging
  colorUnknown?: ColorUnknown
}
export interface Component {
  component: 'oh-slide-button'
  config: Config
}

export const isConfig: ConfigGuardFn<Config> = (config: unknown): config is Config => {
  return guardConfig<Config>(config, isConfig.validationFn)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-slide-button', component, isConfig, defaultConfig)
}

export {
  Action,
  ActionHttpMethod,
  ActionPageTransition,
  ActionAnalyzerChartType,
  ActionAnalyzerCoordSystem,
  ActionAnalyzerAggregation
}
