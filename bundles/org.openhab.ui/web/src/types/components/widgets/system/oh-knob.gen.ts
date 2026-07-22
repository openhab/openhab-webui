// note: this file is generated and should not be edited by hand

import { guardConfig, guardComponent } from '@/types/widget-ts-template'
import {
  CircleShape,
  LineCap,
  HandleShape
} from '../common.gen.ts'


export interface Config {
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
  variable?: string
  variableKey?: string
}
export interface Component {
  component: 'oh-knob'
  config: Config
}

export const isConfig = (config: unknown): config is Config => {
  return guardConfig<Config>(config)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-knob', component, isConfig, defaultConfig)
}

export {
  CircleShape,
  LineCap,
  HandleShape
}
