import { pd, pn, po, pt } from '../helpers.ts'

export default () => [
  po(
    'chartType',
    'Chart Type',
    'Define a fixed period for the chart, aligned at the beginning of the period, e.g. January 1st at midnight for a year chart. If not set (or set to dynamic), the length of the period will be configurable but certain combinations like aggregated series might not work',
    [
      { value: '', label: 'Dynamic period' },
      { value: 'day', label: 'Day' },
      { value: 'isoWeek', label: 'Week (starting on Monday)' },
      { value: 'week', label: 'Week (starting on Sunday)' },
      { value: 'month', label: 'Month' },
      { value: 'year', label: 'Year' },
      { value: 'twoYears', label: '2 Years' },
      { value: 'threeYears', label: '3 Years' },
      { value: 'fiveYears', label: '5 Years' }
    ]
  ).r(),
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
    { value: '2Y', label: '2Y' },
    { value: '3Y', label: '3Y' },
    { value: '5Y', label: '5Y' },
    { value: '10Y', label: '10Y' }
  ])
    .d('D')
    .v((_value, configuration) => {
      return !configuration.chartType
    }),
  pn('initialWeek', 'Initial Week', 'The initial week of the year for the chart.')
    .c('week')
    .v((_value, configuration) => {
      return configuration.chartType === 'isoWeek' || configuration.chartType === 'week'
    }),
  pt('initialMonth', 'Initial Month', 'The initial month of the year for the chart.')
    .c('month')
    .v((_value, configuration) => {
      return configuration.chartType === 'month'
    }),
  pn('initialYear', 'Initial Year', 'The initial year for the chart.').v((_value, configuration) => {
    return configuration.chartType === 'year'
  }),
  pd('future', 'Future Proportion', 'The proportion of the period that should extend into the future')
    .o([
      { value: '0', label: '0% - Past only' },
      { value: '0.25', label: '25% - 3/4 past, 1/4 future' },
      { value: '0.5', label: '50% - 1/2 past, 1/2 future' },
      { value: '0.75', label: '75% - 1/4 past, 3/4 future' },
      { value: '1', label: '100% - Future only' }
    ])
    .d('0'),
  pn('formatterMaxDecimalPlaces', 'Max Decimal Places', 'The maximum number of decimal places to show for values.').d('2')
]
