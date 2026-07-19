import { pb } from '../helpers.ts'

export default () => [
  pb(
    'embedSvg',
    'Embed SVG',
    'Embed the SVG image directly into the page instead of displaying it as a regular image (default false). ' +
      'Elements marked with an <code>openhab</code> attribute become interactive: they can visualize Item states and perform actions, ' +
      'configured per element id in the <code>embeddedSvgActions</code> config object (YAML only). Requires the URL to point to an SVG file.'
  ),
  pb(
    'embedSvgFlashing',
    'SVG Flashing in Run-Mode',
    'Flashes SVG elements marked with an <code>openhab</code> attribute on hovering in run-mode (default false)'
  ).a()
]
