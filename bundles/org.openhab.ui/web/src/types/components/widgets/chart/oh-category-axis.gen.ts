// note: this file is generated and should not be edited by hand

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

export {
  NameLocation,
  Style
}
