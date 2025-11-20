import {
  ChartType,
  Period,
  Future
} from '../common.ts'

export interface Config {
  chartType: ChartType
  period?: Period
  future?: Future
}

export {
  ChartType,
  Period,
  Future
}
