// definitions for the chart page & widgets

import { WidgetDefinition, po } from '../helpers'

export const OhChartPageDefinition = () => new WidgetDefinition('oh-chart-page', 'Chart Page', 'Visualize historical series')
  .params([
    po('chartType', 'Chart Type', 'Define a fixed period for the chart, aligned at the beginning of the period, e.g. January 1st at midnight for a year chart. If not set (or set to dynamic), the length of the period will be configurable but certain combinations like aggregated series might not work', [
      { value: '', label: 'Dynamic period' },
      { value: 'day', label: 'Day' },
      { value: 'isoWeek', label: 'Week (starting on Monday)' },
      { value: 'week', label: 'Week (starting on Sunday)' },
      { value: 'month', label: 'Month' },
      { value: 'year', label: 'Year' }
    ]).r(),
    po('period', 'Initial Period', 'The initial period for the chart', [
      { value: 'h', label: 'h' },
      { value: '2h', label: '2h' },
      { value: '4h', label: '4h' },
      { value: '12h', label: '12h' },
      { value: 'D', label: 'D' },
      { value: '2D', label: '2D' },
      { value: '3D', label: '3D' },
      { value: 'W', label: 'W' },
      { value: '2W', label: '2W' },
      { value: 'M', label: 'M' },
      { value: '2M', label: '2M' },
      { value: '4M', label: '4M' },
      { value: '6M', label: '6M' },
      { value: 'Y', label: 'Y' }
    ]).v((value, configuration, configDescription, parameters) => {
      return !configuration.chartType
    })
  ])
