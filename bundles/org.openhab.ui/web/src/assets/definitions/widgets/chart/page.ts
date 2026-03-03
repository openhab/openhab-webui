// definitions for the chart page & widgets

import { WidgetDefinition } from '../helpers.js'

import ChartParameters from '../system/chart.js'
export const OhChartPageDefinition = () =>
  new WidgetDefinition('oh-chart-page', 'Chart Page', 'Visualize historical series').params(ChartParameters())
