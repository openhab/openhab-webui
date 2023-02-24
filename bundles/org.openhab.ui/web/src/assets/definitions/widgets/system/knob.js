import { pi, pb, pn, pd, pt } from '../helpers.js'

export default () => [
  pi('item', 'Item', 'Item to control'),
  pn('min', 'Min', 'Minimum value (default 0)'),
  pn('max', 'Max', 'Maximum value (default 100)'),
  pt('circleShape', 'Circle Shape', 'full, pie, half-top/-bottom/-left/-right, quarter-top-left/-right, quarter-bottom-left/-right').a(),
  pn('startAngle', 'Start Angle', 'Angle of circle where the round slider should start (default -50); 0 is 9 o\'clock; only if circleShape is not set').a(),
  pn('endAngle', 'End Angle', 'Angle of circle where the round slider should start (default -130); 360 is 9 o\'clock; only if circleShape is not set').a(),
  pd('stepSize', 'Step', 'Minimum interval between values (default 1)'),
  pb('disabled', 'Disabled', 'Disable the slider (usually set via an expression since the value will not be displayed when disabled)'),
  pn('size', 'Size', 'Visual size of the control in px (or % if responsive is true)'),
  pt('primaryColor', 'Primary Color', 'Color of the value arc (HTML value)'),
  pt('secondaryColor', 'Secondary Color', 'Color of the rest of the control (HTML value)'),
  pt('textColor', 'Text Color', 'Color of the value text (HTML value, default inherits from primaryColor)'),
  pt('borderColor', 'Border Color', 'Sets the border color of the slider; set borderWidth as well! (HTML value)').a(),
  pn('borderWidth', 'Border Width', 'Sets the border width of the slider (px value)').a(),
  pn('strokeWidth', 'Stroke Width', 'Thickness of the arcs (default 18)'),
  pt('lineCap', 'Line End Type', 'butt, round, square, none').a(),
  pn('dottedPath', 'Dotted Path', 'Length of dotted path segments (css stroke-dasharray)').a(),
  pb('responsive', 'Responsive', 'Size the control using percentages instead of pixels'),
  pb('releaseOnly', 'Send command only on release', 'If enabled, no commands are sent during sliding'),
  pn('commandInterval', 'Command Interval', 'Time to wait between subsequent commands in ms (default 200)').a(),
  pn('delayStateDisplay', 'Delay State Display', 'Time to wait before switching from displaying user input to displaying Item state in ms (default 2000)').a()
]
