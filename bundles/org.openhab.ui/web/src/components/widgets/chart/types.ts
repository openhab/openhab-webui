import type { Dayjs } from 'dayjs'
import * as api from '@/api'
import type { BarSeriesOption, HeatmapSeriesOption, LineSeriesOption, ScatterSeriesOption, CustomSeriesOption } from 'echarts'
import type { OhChart, OhAggregateSeries, OhCalendarSeries, OhStateSeries, OhTimeSeries } from '@/types/components/widgets'
import type { AxisBaseOptionCommon, CalendarOption, ComponentOption } from 'echarts/types/dist/shared'
import type { EvaluateExpressionFn } from '@/components/widgets/useWidgetExpression.ts'

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

export type SeriesConfig = OhAggregateSeries.Config | OhCalendarSeries.Config | OhStateSeries.Config | OhTimeSeries.Config

export interface ChartContext {
  chart: Omit<api.RootUiComponent | api.UiComponent, 'config'> & { config: OhChart.Config }
  evaluateExpression: EvaluateExpressionFn
  numberFormatter?: Intl.NumberFormat
  series?: SeriesOption[]
}

export interface AxisComponent {
  get(
    context: ChartContext,
    component: api.UiComponent,
    startTime: Dayjs,
    endTime: Dayjs,
    inverse?: boolean
  ): CalendarOption | AxisBaseOptionCommon
}

export interface MiscChartComponent {
  get(context: ChartContext, component: api.UiComponent, startTime: Dayjs, endTime: Dayjs): ComponentOption
}

export interface SeriesComponent {
  neededItems(context: ChartContext, component: api.UiComponent): string[]
  get(context: ChartContext, component: api.UiComponent, points: api.ItemHistory[], startTime: Dayjs, endTime: Dayjs): SeriesOption
  includeBoundary?(context: ChartContext, component: api.UiComponent): boolean | null
  includeItemState?(context: ChartContext, component: api.UiComponent): boolean | null
}
