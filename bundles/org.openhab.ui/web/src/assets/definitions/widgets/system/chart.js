import { pd, po } from '../helpers.js'

export default () => [
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
    { value: 'Y', label: 'Y' },
    { value: '3Y', label: '3Y' },
    { value: '5Y', label: '5Y' },
    { value: '10Y', label: '10Y' }
  ]).v((value, configuration, configDescription, parameters) => {
    return !configuration.chartType
  }),
  pd('future', 'Future Proportion', 'The proportion of the period that should extend into the future').o([
    { value: 0, label: '0% - Past only' },
    { value: 0.25, label: '25% - 3/4 past, 1/4 future' },
    { value: 0.50, label: '50% - 1/2 past, 1/2 future' },
    { value: 0.75, label: '75% - 1/4 past, 3/4 future' },
    { value: 1, label: '100% - Future only' }
  ])
]
