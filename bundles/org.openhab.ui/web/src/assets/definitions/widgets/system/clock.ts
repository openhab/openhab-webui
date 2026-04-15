import { pt } from '../helpers.ts'

export default () => [
  pt(
    'timeFormat',
    'Time Format',
    'Time format, see <a class="external text-color-blue" target="_blank" href="https://day.js.org/docs/en/display/format">dayjs docs</a>'
  ).o(
    [
      { value: 'LTS', label: "Localized time including seconds ('LTS', e.g. '8:02:18 PM')" },
      { value: 'LT', label: "Localized time ('LT'. e.g. '8:02 PM')" },
      { value: 'HH:mm:ss', label: "Current time ('HH:mm:ss')" }
    ],
    false
  ),
  pt('timezone', 'Timezone', 'Timezone to use for the clock.').o(
    Intl.supportedValuesOf('timeZone').map((tz) => ({ value: tz, label: tz })),
    false
  ),
  pt(
    'dateFormat',
    'Date Format',
    'Date format, see <a class="external text-color-blue" target="_blank" href="https://day.js.org/docs/en/display/format">dayjs docs</a>'
  )
    .o(
      [
        { value: 'LL', label: "Localized long date ('LL', e.g. 'August 16, 2018')" },
        { value: 'L', label: "Localized short date ('L', e.g. '08/16/2018')" },
        { value: 'MM/DD/YYYY', label: "Current date ('MM/DD/YYYY')" }
      ],
      false
    )
    .v((value, configuration, configDescription, parameters) => {
      return configuration.showDate === true
    })
]
