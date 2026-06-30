// note: this file is generated and should not be edited by hand

import {
  CircleShape,
  LineCap,
  HandleShape
} from '../common.gen.ts'

export interface Config {
  title?: string
  footer?: string
  noBorder?: boolean
  noShadow?: boolean
  outline?: boolean
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
}
import { guardConfig, guardComponent } from '@/types/widget-ts-template'

export interface Component {
  component: 'oh-knob-card'
  config: Config
}

export const isConfig = (config: unknown): config is Config => {
  return guardConfig<Config>(config)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-knob-card', component as Component, isConfig, defaultConfig)
}

export {
  CircleShape,
  LineCap,
  HandleShape
}
