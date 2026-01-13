import { pt, pb, pn } from '../helpers.js'

export default () => [
  pt('text', 'Text', 'Button label'),
  pb('round', 'Round', 'Makes button round'),
  pb('large', 'Large', 'Makes button large'),
  pb('small', 'Small', 'Makes button small'),
  pb('fill', 'Fill', 'Makes button filled with color'),
  pb('raised', 'Raised', 'Makes button raised'),
  pb('outline', 'Outline', 'Makes button outline'),
  pt('active', 'Active', 'Button is active (when part of a f7-segmented').a(),
  pt(
    'iconF7',
    'Icon',
    'Framework7 icon to display (<a class="external text-color-theme-alt" target="_blank" href="https://framework7.io/icons/">Framework7 icon</a>)'
  ),
  pt('iconMaterial', 'Icon', 'Material design icon to display'),
  pt('iconColor', 'Icon Color', 'Not applicable to openHAB icons'),
  pn('iconSize', 'Icon Size', 'Size of the icon in px'),
  pt('tooltip', 'Tooltip', 'Button tooltip text to show on button hover/press').a()
]
