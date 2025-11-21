// note: this file is generated and should not be edited by hand

import {
  NameLocation
} from '../common.ts'

export enum CategoryType {
  hour = 'hour',
  day = 'day',
  week = 'week',
  month = 'month',
  year = 'year',
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
  gridIndex?: number
  categoryType: CategoryType
  weekdayFormat: WeekdayFormat
  startonSunday?: boolean
  monthFormat: MonthFormat
  data?: string[]
}

export {
  NameLocation
}
