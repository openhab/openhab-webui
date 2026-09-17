// note: this file is generated and should not be edited by hand

import { guardConfig, guardComponent, type ConfigGuardFn } from '@/types/widget-ts-template'

export interface Config {
  colNum?: number
  margin?: number
  verticalCompact?: boolean
  screenWidth?: number
  screenHeight?: number
  scale?: boolean
  hideNavbar?: boolean
  hideSidebarIcon?: boolean
  showFullscreenIcon?: boolean
}
export interface Component {
  component: 'oh-grid-layout'
  config: Config
}

export const isConfig: ConfigGuardFn<Config> = (config: unknown): config is Config => {
  return guardConfig<Config>(config, isConfig.validationFn)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-grid-layout', component, isConfig, defaultConfig)
}
