import { pb, pt } from '../helpers'

export default () => [
  pt('timeFormat', 'Time Format', 'Time format, see <a class="external text-color-blue" target="_blank" href="https://day.js.org/docs/en/display/format">dayjs docs</a>').o([
    { value: 'LTS', label: 'Localized time including seconds (\'LTS\', e.g. \'8:02:18 PM\')' },
    { value: 'LT', label: 'Localized time (\'LT\'. e.g. \'8:02 PM\')' },
    { value: 'HH:mm:ss', label: 'Current time (\'HH:mm:ss\')' }
  ], false),
  pt('background', 'Background style', 'Background style (in CSS "background" attribute format)'),
  pt('timeFontSize', 'Time Font Size', 'Time font size (e.g. "34px")'),
  pt('timeFontWeight', 'Time Font Weight', 'Time font weight (e.g. "normal" or "bold")'),
  pb('showDate', 'Show the date', 'Show the current date in addition to the time'),
  pt('dateFormat', 'Date Format', 'Date format, see <a class="external text-color-blue" target="_blank" href="https://day.js.org/docs/en/display/format">dayjs docs</a>').o([
    { value: 'LL', label: 'Localized long date (\'LL\', e.g. \'August 16, 2018\')' },
    { value: 'L', label: 'Localized short date (\'L\', e.g. \'08/16/2018\')' },
    { value: 'MM/DD/YYYY', label: 'Current date (\'MM/DD/YYYY\')' }
  ], false).v((value, configuration, configDescription, parameters) => {
    return configuration.showDate === true
  }),
  pt('datePos', 'Date Position', 'Where to show the date').o([
    { value: 'above', label: 'Above time' },
    { value: 'below', label: 'Below time' }
  ]).v((value, configuration, configDescription, parameters) => {
    return configuration.showDate === true
  }),
  pt('dateFontSize', 'Date Font Size', 'Date font size (e.g. "34px")')
    .v((value, configuration, configDescription, parameters) => {
      return configuration.showDate === true
    }),
  pt('dateFontWeight', 'Date Font Weight', 'Date font weight (e.g. "normal" or "bold")')
    .v((value, configuration, configDescription, parameters) => {
      return configuration.showDate === true
    })
]
