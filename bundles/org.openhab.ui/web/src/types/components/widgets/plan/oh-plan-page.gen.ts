// note: this file is generated and should not be edited by hand

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
}
import { guardConfig, guardComponent } from '@/types/widget-ts-template'

export interface Component {
  component: 'oh-plan-page'
  config: Config
}

export const isConfig = (config: unknown): config is Config => {
  return guardConfig<Config>(config)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-plan-page', component as Component, isConfig, defaultConfig)
}
