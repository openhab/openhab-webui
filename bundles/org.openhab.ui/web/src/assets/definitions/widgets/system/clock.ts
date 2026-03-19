import { pt, po } from '../helpers.ts'

export default () => [
  pt(
    'format',
    'Date Format',
    'Date format, see <a class="external text-color-blue" target="_blank" href="https://day.js.org/docs/en/display/format">dayjs docs</a>'
  ),
  po(
    'timezone',
    'Timezone',
    'Timezone to use for the clock.',
    [
      ...Intl.supportedValuesOf('timeZone').map(tz => ({ value: tz, label: tz }))
    ]
  )
]
