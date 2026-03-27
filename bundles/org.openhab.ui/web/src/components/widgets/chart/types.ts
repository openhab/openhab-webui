import type { Dayjs } from 'dayjs'
import * as api from '@/api'
import type { BarSeriesOption, HeatmapSeriesOption, LineSeriesOption, ScatterSeriesOption, CustomSeriesOption } from 'echarts'
import type {
  OhChart,
  OhAggregateSeries,
  OhCalendarSeries,
  OhStateSeries,
  OhTimeSeries,
  OhDataSeries,
  OhCalendarAxis,
  OhCategoryAxis,
  OhTimeAxis,
  OhValueAxis
} from '@/types/components/widgets'
import type {
  CalendarOption,
  CategoryAxisBaseOption,
  ComponentOption,
  NumericAxisBaseOptionCommon,
  TimeAxisBaseOption
} from 'echarts/types/dist/shared'
import type { WidgetContext } from '@/components/widgets/types'

export type OhAggregateSeriesOption = OhAggregateSeries.Config &
  (LineSeriesOption | BarSeriesOption | HeatmapSeriesOption | ScatterSeriesOption)
export type OhCalendarSeriesOption = OhCalendarSeries.Config & (HeatmapSeriesOption | ScatterSeriesOption)
export type OhDataSeriesOption = OhDataSeries.Config & (LineSeriesOption | BarSeriesOption | HeatmapSeriesOption | ScatterSeriesOption)
export type OhStateSeriesOption = OhStateSeries.Config & CustomSeriesOption
export type OhTimeSeriesOption = OhTimeSeries.Config & (LineSeriesOption | BarSeriesOption | HeatmapSeriesOption | ScatterSeriesOption)

export type OhSeriesConfig =
  | OhTimeSeries.Config
  | OhAggregateSeries.Config
  | OhCalendarSeries.Config
  | OhStateSeries.Config
  | OhDataSeries.Config
export type OhSeriesOption =
  | OhTimeSeriesOption
  | OhAggregateSeriesOption
  | OhCalendarSeriesOption
  | OhStateSeriesOption
  | OhDataSeriesOption

/**
 * The same as {@link useWidgetExpression}'s `EvaluateExpressionFn` but without {@link Error} as return type.
 */
export type ChartEvaluateExpressionFn = <T = unknown>(key: string, value: T, context?: WidgetContext, props?: Record<string, unknown>) => T

export interface ChartContext {
  chart: Omit<api.RootUiComponent | api.UiComponent, 'config'> & { config: OhChart.Config }
  evaluateExpression: ChartEvaluateExpressionFn
  numberFormatter?: Intl.NumberFormat
  series?: OhSeriesOption[]
  items?: Record<string, api.EnrichedItem>
}

export type OhCalendarAxisOption = OhCalendarSeries.Config & CalendarOption
export type OhCategoryAxisOption = OhCategoryAxis.Config & CategoryAxisBaseOption
export type OhTimeAxisOption = OhTimeAxis.Config & TimeAxisBaseOption
export type OhValueAxisOption = OhValueAxis.Config & NumericAxisBaseOptionCommon

export type OhAxisOption = OhTimeAxisOption | OhCategoryAxisOption | OhCalendarAxisOption | OhValueAxisOption

export interface AxisComponent {
  get(context: ChartContext, component: api.UiComponent, startTime: Dayjs, endTime: Dayjs, inverse?: boolean): OhAxisOption
}

export interface MiscChartComponent {
  get(context: ChartContext, component: api.UiComponent, startTime: Dayjs, endTime: Dayjs): ComponentOption
}

export interface SeriesComponent {
  neededItems(context: ChartContext, component: api.UiComponent): string[]
  get(context: ChartContext, component: api.UiComponent, points: api.ItemHistory[], startTime: Dayjs, endTime: Dayjs): OhSeriesOption
  includeBoundary?(context: ChartContext, component: api.UiComponent): boolean | null
  includeItemState?(context: ChartContext, component: api.UiComponent): boolean | null
}
