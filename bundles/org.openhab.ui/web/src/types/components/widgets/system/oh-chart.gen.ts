// note: this file is generated and should not be edited by hand

import {
  ChartType,
  type Period
} from '../common.gen.ts'

export interface Config {
  chartType: ChartType
  period?: Period
  initialWeek?: number
  initialMonth?: string
  initialYear?: number
  future?: number
  formatterMaxDecimalPlaces?: number
}

export {
  ChartType,
  type Period
}
