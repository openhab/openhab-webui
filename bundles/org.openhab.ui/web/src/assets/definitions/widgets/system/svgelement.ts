import { pi, pb, pt, po } from '../helpers.ts'

export default () => [
  pi('stateItems', 'State Item(s)', 'Item(s) that should be used to determine the state').m().a(),
  pb(
    'useProxyElementForState',
    'Use State Proxy Element',
    'Use "flash" element to highlight the active state. The element is marked with the attribute flash: true and must be part of the elements group'
  ).a(),
  pt(
    'stateOnColor',
    'State ON Color',
    'Color to use when the State is "on". Any CSS color (#rgb, rgb(), named, …) or openHAB HSB (h,s,b) is supported. Applied to the fill, or the stroke for fill:none outline shapes.'
  ).a(),
  pt(
    'stateOffColor',
    'State OFF Color',
    'Color to use when the State is "off". Any CSS color (#rgb, rgb(), named, …) or openHAB HSB (h,s,b) is supported. If omitted, the original color is restored.'
  ).a(),
  po(
    'colorProperty',
    'Apply Color To',
    'Which property the State ON/OFF colors are applied to. "Auto" uses the stroke for outline shapes (fill:none) and the fill otherwise.',
    [
      { value: '', label: 'Auto' },
      { value: 'fill', label: 'Fill' },
      { value: 'stroke', label: 'Stroke' }
    ]
  ).a(),
  pt(
    'stateOnSubstitute',
    'State ON Substitute',
    'If Item Type is String and State equals to the given value, this is interpreted as "ON"'
  ).a(),
  pb('stateAsOpacity', 'Use State as Opacity', 'Use the state from 0 - 100 as element opacity').a(),
  pt('stateMinOpacity', 'Minimum Opacity applied', 'This allows an opacity to be kept above this value.').a(),
  pb('invertStateOpacity', 'Invert State opacity', '1 - opacity').a(),
  pt(
    'stateOnAsStyleClass',
    'Set Style Class based on On State ',
    'Provide element-id:classname, separate multiple entries with comma. ON sets the class, if OFF is not provided, OFF removes the class of given element'
  ).a(),
  pt(
    'stateOffAsStyleClass',
    'Set Style Class based on Off State ',
    'Provide element-id:classname, separate multiple entries with comma. OFF sets the class'
  ).a(),
  pb('useDisplayState', 'Use displayState as Text', 'Use the formatted state value to write into tspan').a()
]
