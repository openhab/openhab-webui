import type { Item, Page } from '@/types/openhab'
import { ChartType, OhChartVisualmap } from '@/types/components/widgets/index.gen.ts'
import type { TimeCoordSettings } from './chart-time'
import type { AggregateCoordSettings } from './chart-aggregate'
import type { CalendarCoordSettings } from './chart-calendar'

export interface CoordSettingsBase {
  chartType: ChartType
  typeOptions: Array<ChartType>
}

export interface CoordSystem {
  initCoordSystem: (settings?: CoordSettingsBase) => CoordSettings
  initAxes: (settings: CoordSettingsBase) => void
  initSeries: (item: Item, coordSettings: CoordSettings, seriesOptions: Partial<SeriesOptions>) => SeriesOptions
  getChartPage: (coordSettings: CoordSettings, allSeriesOptions: Record<string, SeriesOptions>, items: Item[]) => Page
}

export type CoordSettings = TimeCoordSettings | AggregateCoordSettings | CalendarCoordSettings

export enum SeriesType {
  none = '',
  line = 'line',
  bar = 'bar',
  area = 'area',
  state = 'state',
  heatmap = 'heatmap'
}

export interface SeriesOptions {
  name: string
  type: SeriesType
  typeOptions: Array<SeriesType>
}

export interface ValueAxisOptions {
  name: string
  unit: string
  split?: ValueAxisSplitOptions
  min?: string
  max?: string
  scale?: boolean
}

export enum ValueAxisSplitOptions {
  none = 'none',
  line = 'line',
  area = 'area',
  line_area = 'line+area',
  line_minor = 'line+minor',
  area_minor = 'area+minor',
  all = 'all'
}

export interface VisualMap {
  palette: OhChartVisualmap.PresetPalette
  min: number | string | null
  max: number | string | null
  type: OhChartVisualmap.Type
}

export enum Marker {
  none = 'none',
  avg = 'avg',
  min = 'min',
  max = 'max',
  min_max = 'min-max',
  all = 'all'
}
