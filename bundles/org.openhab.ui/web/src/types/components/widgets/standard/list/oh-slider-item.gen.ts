// note: this file is generated and should not be edited by hand

export interface Config {
  title?: string
  subtitle?: string
  after?: string
  icon?: string
  iconColor?: string
  iconUseState?: boolean
  item?: string
  min?: number
  max?: number
  step?: number
  vertical?: boolean
  label?: boolean
  scale?: boolean
  scaleSteps?: number
  scaleSubSteps?: number
  unit?: string
  ignoreDisplayState?: boolean
  releaseOnly?: boolean
  commandInterval?: number
  delayStateDisplay?: number
}
import { guardConfig, guardComponent } from '@/types/widget-ts-template'

export interface Component {
  component: 'oh-slider-item'
  config: Config
}

export const isConfig = (config: unknown): config is Config => {
  return guardConfig<Config>(config)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-slider-item', component as Component, isConfig, defaultConfig)
}
