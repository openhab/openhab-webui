// note: this file is generated and should not be edited by hand

export enum VisibleTo {
  role_administrator = 'role:administrator',
  role_user = 'role:user'
}

export interface Config {
  layerName?: string
  preload?: boolean
  visible?: string
  visibleTo?: VisibleTo
}
import { guardConfig, guardComponent } from '@/types/widget-ts-template'

export interface Component {
  component: 'oh-canvas-layer'
  config: Config
}

export const isConfig = (config: unknown): config is Config => {
  return guardConfig<Config>(config)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-canvas-layer', component as Component, isConfig, defaultConfig)
}
