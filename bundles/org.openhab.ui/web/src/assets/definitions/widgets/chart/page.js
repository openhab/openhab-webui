// definitions for the chart page & widgets

import { WidgetDefinition } from '../helpers'

import ChartParameters from '../system/chart'
export const OhChartPageDefinition = () => new WidgetDefinition('oh-chart-page', 'Chart Page', 'Visualize historical series')
  .params(ChartParameters())
