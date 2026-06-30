// note: this file is generated and should not be edited by hand

export interface Config {
  top?: string
  bottom?: string
  left?: string
  right?: string
  width?: string
  height?: string
  show?: boolean
  containLabel?: boolean
}
import { guardConfig, guardComponent } from '@/types/widget-ts-template'

export interface Component {
  component: 'oh-chart-grid'
  config: Config
}

export const isConfig = (config: unknown): config is Config => {
  return guardConfig<Config>(config)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-chart-grid', component as Component, isConfig, defaultConfig)
}
