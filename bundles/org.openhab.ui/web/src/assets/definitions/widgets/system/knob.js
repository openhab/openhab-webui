import { pi, pb, pn, pd, pt } from '../helpers.js'

export default () => [
  pi('item', 'Item', 'Item to control'),
  pb('useSliderControl', 'Use Slider Control', 'Use <a class="external text-color-blue" target="_blank" href="https://vue.roundsliderui.com/">round-slider control</a> instead of knob control (allows more customization) - parameters are advanced!'),
  pn('min', 'Min', 'Minimum value (default 0)'),
  pn('max', 'Max', 'Maximum value (default 100)'),
  pt('circleShape', 'Circle Shape', 'full, pie, half-top/-bottom/-left/-right, quarter-top-left/-right, quarter-bottom-left/-right - slider control only!').a(),
  pn('startAngle', 'Start Angle', 'Angle of circle where the round slider should start (default 0); 0 is 9 o\'clock; only if circleShape is not set - slider control only!').a(),
  pn('endAngle', 'End Angle', 'Angle of circle where the round slider should start (default 360); 360 is 9 o\'clock; only if circleShape is not set - slider control only!').a(),
  pd('stepSize', 'Step', 'Minimum interval between values (default 1)'),
  pb('disabled', 'Disabled', 'Disable the slider (usually set via an expression since the value will not be displayed when disabled)'),
  pn('size', 'Size', 'Visual size of the control in px (or % if responsive is true)'),
  pt('primaryColor', 'Primary Color', 'Color of the value arc (HTML value, default #409eff)'),
  pt('secondaryColor', 'Secondary Color', 'Color of the rest of the control (HTML value, default #dcdfe6)'),
  pt('textColor', 'Text Color', 'Color of the value text (HTML value, default #000000)'),
  pt('borderColor', 'Border Color', 'Sets the border color of the slider. By default it will inherit the primaryColor value (HTML value, default #000000) - slider control only!'),
  pn('borderWidth', 'Border Width', 'Indicates the border width of the slider - slider control only!').a(),
  pn('strokeWidth', 'Stroke Width', 'Thickness of the arcs (default 17)'),
  pt('lineCap', 'Line End Type', 'butt, round, square, none - slider control only!').a(),
  pt('dottedPath', 'Dotted Path', 'Length of dotted path segments (css stroke-dasharray) - slider control only!').a(),
  pb('responsive', 'Responsive', 'Size the control using percentages instead of pixels'),
  pb('releaseOnly', 'Send command only on release', 'If enabled, no commands are sent during sliding'),
  pn('commandInterval', 'Command Interval', 'Time to wait between subsequent commands in ms (default 200)'),
  pn('delayStateDisplay', 'Delay State Display', 'Time to wait before switching from displaying user input to displaying item state in ms (default 2000)').a()
]
