import type { MarkLineOption, MarkPointOption } from 'echarts/types/dist/shared'

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
