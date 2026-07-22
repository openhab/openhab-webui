// note: this file is generated and should not be edited by hand

import { guardConfig, guardComponent } from '@/types/widget-ts-template'
import {
  NameLocation,
  Style
} from '../common.gen.ts'


export enum CategoryType {
  hour = 'hour',
  day = 'day',
  week = 'week',
  month = 'month',
  year = 'year',
  years = 'years',
  values = 'values'
}

export enum WeekdayFormat {
  default = 'default',
  short = 'short',
  min = 'min'
}

export enum MonthFormat {
  default = 'default',
  short = 'short'
}

export interface Config {
  name?: string
  nameLocation?: NameLocation
  nameGap?: number
  nameRotate?: string
  style?: Style
  gridIndex?: number
  categoryType: CategoryType
  weekdayFormat: WeekdayFormat
  monthFormat: MonthFormat
  data?: string[]
}
export interface Component {
  component: 'oh-category-axis'
  config: Config
}

export const isConfig = (config: unknown): config is Config => {
  return guardConfig<Config>(config)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-category-axis', component, isConfig, defaultConfig)
}

export {
  NameLocation,
  Style
}
