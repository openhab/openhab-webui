import { pb, pi, pt } from '../helpers.js'

export default () => [
  pt('icon', 'Icon', '<code>oh:iconName</code> or <code>iconName</code> (<a class="external text-color-blue" target="_blank" href="https://www.openhab.org/link/icons">openHAB icon</a>), <code>f7:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://framework7.io/icons">Framework7 icon</a>), <code>material:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://jossef.github.io/material-design-icons-iconfont/">Material icon</a>) or <code>iconify:iconSet:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://icon-sets.iconify.design">Iconify icon</a>, requires being online if not in cache)'),
  pi('width', 'Width', 'Width of the icon in pixels'),
  pi('height', 'Height', 'Height of the icon in pixels'),
  pt('color', 'Color', 'Color of the icon (for F7/Material icons, a <a class="external text-color-blue" target="_blank" href="https://v5.framework7.io/docs/color-themes.html#colors">Framework7 color theme</a>, for Iconify icons, a CSS color). Not applicable to OH icons.'),
  pb('inline', 'Inline', 'Display the icon inline (for Iconify icons only)'),
  pt('rotate', 'Rotate', 'Rotate the icon (for Iconify icons only; use a CSS value e.g. 90deg)'),
  pb('horizontalFlip', 'Horizontal Flip', 'Flips the icon horizontally (for Iconify icons only)'),
  pb('verticalFlip', 'Vertical Flip', 'Flips the icon vertically (for Iconify icons only)'),
  pb('state', 'State', 'State of the icon (usually the state of an item) to use dynamic icons')
]
