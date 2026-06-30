// note: this file is generated and should not be edited by hand

import {
  TimeFormat,
  Timezone,
  DateFormat
} from '../common.gen.ts'

export interface Config {
  timeFormat?: TimeFormat
  timezone?: Timezone
  dateFormat?: DateFormat
}
import { guardConfig, guardComponent } from '@/types/widget-ts-template'

export interface Component {
  component: 'oh-clock'
  config: Config
}

export const isConfig = (config: unknown): config is Config => {
  return guardConfig<Config>(config)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-clock', component as Component, isConfig, defaultConfig)
}

export {
  TimeFormat,
  Timezone,
  DateFormat
}
