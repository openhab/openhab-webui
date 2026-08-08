import { OhSvgElement } from '@/types/components/widgets'

// note: this file is generated and should not be edited by hand

import { guardConfig, guardComponent, type ConfigGuardFn } from '@/types/widget-ts-template'

export enum BackgroundColor {
  none = '',
  white = 'white',
  black = 'black',
  blackwhite = 'blackwhite'
}

export enum TooltipColor {
  white = 'white',
  black = 'black',
  blackwhite = 'blackwhite'
}

export interface Config {
  imageUrl?: string
  imageWidth?: number
  imageHeight?: number
  noZoomOrDrag?: boolean
  noZoomAnimation?: boolean
  noMarkerZoomAnimation?: boolean
  backgroundColor?: BackgroundColor
  darkModeInvert?: boolean
  tooltipColor?: TooltipColor
  embedSvg?: boolean
  embedSvgFlashing?: boolean
  embeddedSvgActions?: Record<string, OhSvgElement.Config>
}
export interface Component {
  component: 'oh-plan-page'
  config: Config
}

export const isConfig: ConfigGuardFn<Config> = (config: unknown): config is Config => {
  return guardConfig<Config>(config, isConfig.validationFn)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-plan-page', component, isConfig, defaultConfig)
}
