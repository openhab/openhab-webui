// note: this file is generated and should not be edited by hand

import { guardConfig, guardComponent, type ConfigGuardFn } from '@/types/widget-ts-template'

export interface Config {
  grid?: number
  screenWidth?: number
  screenHeight?: number
  scale?: boolean
  imageUrl?: string
  imageSrcSet?: string
  embedSvg?: boolean
  embedSvgFlashing?: boolean
  hideNavbar?: boolean
  hideSidebarIcon?: boolean
  showFullscreenIcon?: boolean
  boxShadow?: string
  textShadow?: string
  filterShadow?: string
}
export interface Component {
  component: 'oh-canvas-layout'
  config: Config
}

export const isConfig: ConfigGuardFn<Config> = (config: unknown): config is Config => {
  return guardConfig<Config>(config, isConfig.validationFn)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-canvas-layout', component, isConfig, defaultConfig)
}
