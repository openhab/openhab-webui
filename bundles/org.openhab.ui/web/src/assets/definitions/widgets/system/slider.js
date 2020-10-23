import { pi, pt, pb, pn, pd } from '../helpers'

export default () => [
  pi('item', 'Item', 'Item to control'),
  pd('min', 'Min', 'Minimum value'),
  pd('max', 'Max', 'Maximum value'),
  pd('step', 'Step', 'Minimum interval between values'),
  pd('vertical', 'Vertical', 'Display the slider vertically'),
  pb('label', 'Display Label', 'Display a label above the slider knob'),
  pb('scale', 'Display Scale', 'Display a scale on the slider'),
  pn('scaleSteps', 'Scale steps', 'Number of (major) scale markers'),
  pn('scaleSubSteps', 'Scale sub-steps', 'Number of scale minor markers between each major marker'),
  pt('unit', 'Unit', 'Text to append to the label while dragging the cursor')
]
