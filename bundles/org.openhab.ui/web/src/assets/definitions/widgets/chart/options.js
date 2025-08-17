export const dimensionTypeOptions = [
  { value: 'minute', label: 'Minute of Hour' },
  { value: 'hour', label: 'Hour of Day' },
  { value: 'isoWeekday', label: 'Day of Week (starting on Monday)' },
  { value: 'weekday', label: 'Day of Week (starting on Sunday)' },
  { value: 'date', label: 'Day of Month' },
  { value: 'month', label: 'Month of Year' }
]

export const aggregationTypeOptions = [
  { value: 'average', label: 'Average' },
  { value: 'sum', label: 'Sum' },
  { value: 'min', label: 'Minimum' },
  { value: 'max', label: 'Maximum' },
  { value: 'first', label: 'First (earliest)' },
  { value: 'last', label: 'Last (latest)' },
  { value: 'diff_first', label: 'Difference of firsts' },
  { value: 'diff_last', label: 'Difference of lasts' }
]

export const markerOptions = [
  { value: 'avg', label: 'Average' },
  { value: 'min', label: 'Minimum' },
  { value: 'max', label: 'Maximum' },
  { value: 'time', label: 'Current Time' }
]
