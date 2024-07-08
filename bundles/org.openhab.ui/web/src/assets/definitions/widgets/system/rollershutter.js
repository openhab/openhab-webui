import { pt, pi, pb } from '../helpers.js'

export default () => [
  pi('item', 'Item', 'Rollershutter item to control'),
  pt('buttonStyle', 'style', 'CSS style for buttons'),
  pt('dirIconsStyle', 'Direction Icons Style', 'Icons to use for the UP/DOWN buttons').o([
    'arrowtriangle_{dir}',
    'arrowtriangle_{dir}_fill',
    'arrowtriangle_{dir}_circle',
    'arrowtriangle_{dir}_circle_fill',
    'arrowtriangle_{dir}_square',
    'arrowtriangle_{dir}_square_fill',
    'chevron_{dir}',
    'chevron_{dir}_2',
    'chevron_compact_{dir}_2',
    'chevron_{dir}_fill',
    'chevron_{dir}_circle',
    'chevron_{dir}_circle_fill',
    'chevron_{dir}_square',
    'chevron_{dir}_square_fill',
    'arrow_{dir}',
    'arrow_{dir}_2',
    'arrow_{dir}_fill',
    'arrow_{dir}_circle',
    'arrow_{dir}_circle_fill',
    'arrow_{dir}_square',
    'arrow_{dir}_square_fill',
    'arrow_{dir}_to_line',
    'arrow_{dir}_to_line_alt'
  ].map((o) => { return { value: o, label: o } })),
  pt('stopIconStyle', 'Stop Icon Style', 'Icons to use for the STOP button').o([
    'stop',
    'stop_fill',
    'stop_circle',
    'stop_circle_fill',
    'multiply',
    'multiply_fill',
    'multiply_circle',
    'multiply_circle_fill'
  ].map((o) => { return { value: o, label: o } })),
  pb('stateInCenter', 'State in Center', 'Display state value inside the STOP button instead of icon')
]
