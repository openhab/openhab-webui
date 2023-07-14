import { pi, pt, pb, pn, pd } from '../helpers.js'

export default () => [
  pi('item', 'Item', 'Item to control'),
  pd('min', 'Min', 'Minimum value'),
  pd('max', 'Max', 'Maximum value'),
  pd('step', 'Step', 'Minimum interval between values'),
  pd('vertical', 'Vertical', 'Display the slider vertically'),
  pb('label', 'Display Label', 'Display a label above the slider knob while sliding'),
  pb('scale', 'Display Scale', 'Display a scale on the slider'),
  pn('scaleSteps', 'Scale steps', 'Number of (major) scale markers'),
  pn('scaleSubSteps', 'Scale sub-steps', 'Number of scale minor markers between each major marker'),
  pt('unit', 'Unit', 'Unit for the command sent and also append to the label while dragging the cursor, leave empty to use Item\'s unit'),
  pb('ignoreDisplayState', 'Ignore Display State', 'Ignore the display state if available and always use the raw state.'),
  pb('releaseOnly', 'Send command only on release', 'If enabled, no commands are sent during sliding'),
  pn('commandInterval', 'Command Interval', 'Time to wait between subsequent commands in ms (default 200)'),
  pn('delayStateDisplay', 'Delay State Display', 'Time to wait before switching from displaying user input to displaying item state in ms (default 2000)').a()
]
