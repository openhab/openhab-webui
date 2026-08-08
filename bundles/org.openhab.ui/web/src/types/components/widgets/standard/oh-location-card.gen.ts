// note: this file is generated and should not be edited by hand

import { guardConfig, guardComponent } from '@/types/widget-ts-template'
import {
  BackgroundColor
} from '../common.gen.ts'


export enum Badges {
  battery = 'battery',
  lights = 'lights',
  windows = 'windows',
  doors = 'doors',
  garagedoors = 'garagedoors',
  blinds = 'blinds',
  presence = 'presence',
  lock = 'lock',
  climate = 'climate',
  screens = 'screens',
  projectors = 'projectors',
  speakers = 'speakers',
  temperature = 'temperature',
  humidity = 'humidity',
  co2 = 'co2',
  luminance = 'luminance'
}

export interface Config {
  item?: string
  title?: string
  subtitle?: string
  backgroundColor?: BackgroundColor
  backgroundImage?: string
  invertText?: boolean
  disableBadges?: boolean
  badges?: Badges
}
export interface Component {
  component: 'oh-location-card'
  config: Config
}

export const isConfig = (config: unknown): config is Config => {
  return guardConfig<Config>(config)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-location-card', component, isConfig, defaultConfig)
}

export {
  BackgroundColor
}
