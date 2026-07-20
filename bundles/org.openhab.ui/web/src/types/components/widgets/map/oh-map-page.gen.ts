// note: this file is generated and should not be edited by hand

import { guardConfig, guardComponent } from '@/types/widget-ts-template'

export interface Config {
  initialCenter?: string
  initialZoom?: string
  noZoomOrDrag?: boolean
  noZoomAnimation?: boolean
  noMarkerZoomAnimation?: boolean
  tileLayerProvider?: string
  overlayTileLayerProvider?: string
}
export interface Component {
  component: 'oh-map-page'
  config: Config
}

export const isConfig = (config: unknown): config is Config => {
  return guardConfig<Config>(config)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-map-page', component as Component, isConfig, defaultConfig)
}
