import { pi, pb, pn, pd, pt } from '../helpers'

export default () => [
  pi('item', 'Item', 'Item to control'),
  pn('min', 'Min', 'Minimum value (default 0)'),
  pn('max', 'Max', 'Maximum value (default 100)'),
  pd('stepSize', 'Step', 'Minimum interval between values (default 1)'),
  pb('disabled', 'Disabled', 'Disable the slider (usually set via an expression since the value will not be displayed when disabled)'),
  pn('size', 'Size', 'Visual size of the control in px (or % if responsive is true)'),
  pt('primaryColor', 'Primary Color', 'Color of the value arc (HTML value, default #409eff)'),
  pt('secondaryColor', 'Secondary Color', 'Color of the rest of the control (HTML value, default #dcdfe6)'),
  pt('textColor', 'Text Color', 'Color of the value text (HTML value, default #000000)'),
  pt('strokeWidth', 'Stroke Width', 'Thickness of the arcs, default 17'),
  pb('responsive', 'Responsive', 'Size the control using percentages instead of pixels')
]
