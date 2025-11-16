import {
  BackgroundColor
} from '../common.ts'

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

export {
  BackgroundColor
}
