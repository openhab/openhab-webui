// definitions for the chart page & widgets

import { WidgetDefinition, pg } from '../helpers'

import ChartParameters from '../system/chart'
export const OhChartPageDefinition = () => new WidgetDefinition('oh-chart-page', 'Chart Page', 'Visualize historical series')
  .paramGroup(pg('chart', 'Chart', 'Parameters are passed to the underlying chart control'), ChartParameters())
