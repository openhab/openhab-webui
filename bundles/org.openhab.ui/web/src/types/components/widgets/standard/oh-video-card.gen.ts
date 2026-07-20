// note: this file is generated and should not be edited by hand

import { guardConfig, guardComponent } from '@/types/widget-ts-template'
import {
  PlayerType
} from '../common.gen.ts'


export interface Config {
  title?: string
  footer?: string
  noBorder?: boolean
  noShadow?: boolean
  outline?: boolean
  item?: string
  url?: string
  type?: string
  hideControls?: boolean
  startManually?: boolean
  startMuted?: boolean
  posterItem?: string
  posterURL?: string
  playerType?: PlayerType
  stunServer?: string
  candidatesTimeout?: number
  sendAudio?: boolean
}
export interface Component {
  component: 'oh-video-card'
  config: Config
}

export const isConfig = (config: unknown): config is Config => {
  return guardConfig<Config>(config)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-video-card', component as Component, isConfig, defaultConfig)
}

export {
  PlayerType
}
