// definitions for the chart page & widgets

import { WidgetDefinition } from '../helpers.ts'

import ChartParameters from '../system/chart.ts'
export const OhChartPageDefinition = () =>
  new WidgetDefinition('oh-chart-page', 'Chart Page', 'Visualize historical series').params(ChartParameters())
