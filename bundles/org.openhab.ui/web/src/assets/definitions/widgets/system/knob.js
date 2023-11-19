import { pi, pb, pn, pd, pt, po } from '../helpers.js'

export default () => [
  // Functionality
  pi('item', 'Item', 'Item to control'),
  pn('min', 'Min', 'Minimum value (default 0)'),
  pn('max', 'Max', 'Maximum value (default 100)'),
  pd('step', 'Step', 'Minimum interval between values (default 1)'),
  pd('offset', 'Offset', 'Offset to be applied to the Item\'s state (e.g. Item state = 2; offset = 20; knob/rounded slider behaves as Item state would be 22)'),
  pb('ignoreDisplayState', 'Ignore Display State', 'Ignore the display state if available and always use the raw state.'),
  pb('releaseOnly', 'Send command only on release', 'If enabled, no commands are sent during sliding'),
  pn('commandInterval', 'Command Interval', 'Time to wait between subsequent commands in ms (default 200)').a(),
  pn('delayStateDisplay', 'Delay State Display', 'Time to wait before switching from displaying user input to displaying Item state in ms (default 2000)').a(),
  pb('disabled', 'Disabled', 'Disable the slider (usually set via an expression since the value will not be displayed when disabled)').a(),
  // Size
  pn('size', 'Size', 'Visual size of the control in px (or % if responsive is true)'),
  pb('responsive', 'Responsive', 'Size the control using percentages instead of pixels'),
  // Appearance
  pn('strokeWidth', 'Stroke Width', 'Thickness of the arcs (default 18)'),
  pn('startAngle', 'Start Angle', 'Angle of circle where the round slider should start (default -50); 0 is 9 o\'clock; only if circleShape is not set').a(),
  pn('endAngle', 'End Angle', 'Angle of circle where the round slider should start (default -130); 360 is 9 o\'clock; only if circleShape is not set').a(),
  po('circleShape', 'Circle Shape', 'Indicates the circle shape to be render', [
    { value: 'full', label: 'full' },
    { value: 'half-top', label: 'half top' },
    { value: 'half-bottom', label: 'half bottom' },
    { value: 'half-left', label: 'half left' },
    { value: 'half-right', label: 'half right' },
    { value: 'quarter-top-left', label: 'quarter top left' },
    { value: 'quarter-top-right', label: 'quarter top right' },
    { value: 'quarter-bottom-left', label: 'quarter bottom left' },
    { value: 'quarter-bottom-right', label: 'quarter bottom right' },
    { value: 'pie', label: 'pie' }
  ]),
  po('lineCap', 'Line Cap', 'Sets the shape of the end of the path; dotted path and line cap cannot be used together.', [
    { value: 'square', label: 'square' },
    { value: 'round', label: 'round' }
  ]),
  pt('dottedPath', 'Dotted Path', 'Length of dotted path segments (using css stroke-dasharray); dotted path and line cap cannot be used together.'),
  pn('borderWidth', 'Border Width', 'Sets the border width of the slider (px value)'),
  pt('handleSize', 'Handle Size', 'Sets the size of the slider handle (px value)'),
  po('handleShape', 'Handle Shape', 'Sets the shape of the slider handle', [
    { value: 'square', label: 'square' },
    { value: 'round', label: 'round' },
    { value: 'dot', label: 'dot' }
  ]),
  pt('borderColor', 'Border Color', 'Sets the border color of the slider; set borderWidth as well! (HTML value)'),
  pt('pathColor', 'Path Color', 'Sets the path color of the slider (HTML value)'),
  pt('rangeColor', 'Range Color', 'Sets the range color of the slider (HTML value)'),
  pt('tooltipColor', 'Tooltip Color', 'Sets the tooltip color of the slider (HTML value)')
]
