import { pi, pn, po, pt } from '../helpers.js'

export default () => [
  pi('item', 'Item', 'Item to control'),
  pn('min', 'Min', 'Minimum value (default 0)'),
  pn('max', 'Max', 'Maximum value (default 100)'),
  po('type', 'Type', 'Type of the gauge', [
    { value: 'circle', label: 'Circle' },
    { value: 'semicircle', label: 'Semicircle' }
  ]),
  pt(
    'value',
    'Value',
    'Value, if the item is not set - between min & max (for instance, defined with an expression)'
  ),
  pn('size', 'Size', 'Visual size of the control in px (default 200)'),
  pt(
    'bgColor',
    'Background Color',
    'Gauge background color. Can be any valid color string, e.g. #ff00ff, rgb(0,0,255), etc.'
  ),
  pt('borderBgColor', 'Border Background Color', 'Main border/stroke background color'),
  pt('borderColor', 'Border Color', 'Main border/stroke color'),
  pt('borderWidth', 'Border Width', 'Main border/stroke width'),
  pt(
    'valueText',
    'Value Text',
    'Value text, if the item is not set (for instance, defined with an expression)'
  ),
  pt('valueTextColor', 'Value Text Color', 'Value text color'),
  pt('valueFontSize', 'Value Font Size', 'Value text font size'),
  pt('valueFontWeight', 'Value Font Weight', 'Value text font weight'),
  pt('labelText', 'Label Text', 'Label text, displayed below the value (optional)'),
  pt('labelTextColor', 'Label Text Color', 'Label text color'),
  pt('labelFontSize', 'Label Font Size', 'Label text font size'),
  pt('labelFontWeight', 'Label Font Weight', 'Label text font weight')
]
