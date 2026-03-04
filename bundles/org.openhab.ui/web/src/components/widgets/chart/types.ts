import type { Dayjs } from 'dayjs'
import * as api from '@/api'
import type { BarSeriesOption, HeatmapSeriesOption, LineSeriesOption, ScatterSeriesOption, CustomSeriesOption } from 'echarts'
import { OhChart } from '@/types/components/widgets'

export enum Marker {
  avg = 'avg',
  min = 'min',
  max = 'max',
  time = 'time'
}

export type StateSeriesOption = CustomSeriesOption
export type SeriesOption = { markers?: Marker[] } & (
  | LineSeriesOption
  | BarSeriesOption
  | HeatmapSeriesOption
  | ScatterSeriesOption
  | StateSeriesOption
)

export type EvaluateExpressionFunction = <T = any>(key: string, value: T) => T

export interface ChartContext {
  chart: Omit<api.RootUiComponent | api.UiComponent, 'config'> & { config: OhChart.Config }
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

export interface SeriesComponent {
  neededItems(context: ChartContext, component: api.UiComponent): string[]
  get(context: ChartContext, component: api.UiComponent, points: api.ItemHistory[], startTime: Dayjs, endTime: Dayjs): SeriesOption
  includeBoundary?(context: ChartContext, component: api.UiComponent): boolean | null
  includeItemState?(context: ChartContext, component: api.UiComponent): boolean | null
}
