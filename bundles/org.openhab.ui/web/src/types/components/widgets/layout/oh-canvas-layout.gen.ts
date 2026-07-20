import { OhSvgElement } from '@/types/components/widgets'

// note: this file is generated and should not be edited by hand

import { guardConfig, guardComponent } from '@/types/widget-ts-template'

export interface Config {
  grid?: number
  screenWidth?: number
  screenHeight?: number
  scale?: boolean
  imageUrl?: string
  imageSrcSet?: string
  embedSvg?: boolean
  embedSvgFlashing?: boolean
	embeddedSvgActions?: Record<string, OhSvgElement.Config>

  hideNavbar?: boolean
  hideSidebarIcon?: boolean
  showFullscreenIcon?: boolean
  gridEnable?: boolean
  activeIdx?: number
  boxShadow?: string
  textShadow?: string
  filterShadow?: string
}
export interface Component {
  component: 'oh-canvas-layout'
  config: Config
}

export const isConfig = (config: unknown): config is Config => {
  return guardConfig<Config>(config, (config) => 'layoutType' in config && config.layoutType === 'fixed' && 'fixedType' in config && config.fixedType === 'canvas')
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-canvas-layout', component as Component, isConfig, defaultConfig)
}
