import { pi, pb, pn, pd } from '../helpers'

export default () => [
  pi('item', 'Item', 'Item to control'),
  pn('min', 'Min', 'Minimum value'),
  pn('max', 'Max', 'Maximum value'),
  pd('step', 'Step', 'Minimum interval between values'),
  pd('vertical', 'Vertical', 'Display the slider vertically'),
  pb('label', 'Display Label', 'Display a label above the slider knob'),
  pb('scale', 'Display Scale', 'Display a scale on the slider'),
  pb('scaleSteps', 'Scale steps', 'Number of (major) scale markers'),
  pb('scaleSubSteps', 'Scale sub-steps', 'Number of scale minor markers between each major marker')
]
