import type { MarkLineOption, MarkPointOption } from 'echarts/types/dist/shared'
import type { Dayjs } from 'dayjs'
import * as api from '@/api'

export enum Marker {
  avg = 'avg',
  min = 'min',
  max = 'max',
  time = 'time'
}

export interface Series {
  markers?: Marker[]
  markLine?: MarkLineOption
  markPoint?: MarkPointOption
}

export type EvaluateExpressionFunction = <T = any>(key: string, value: T) => T

export interface ChartContext {
  chart: api.RootUiComponent | api.UiComponent
  evaluateExpression: EvaluateExpressionFunction
  numberFormatter?: Intl.NumberFormat
  series?: {
    data: number[][]
  }[]
}

export interface AxisComponent {
  get(context: ChartContext, component: api.UiComponent, startTime: Dayjs, endTime: Dayjs, inverse?: boolean): any
}

export interface MiscChartComponent {
  get(context: ChartContext, component: api.UiComponent, startTime: Dayjs, endTime: Dayjs): any
}
