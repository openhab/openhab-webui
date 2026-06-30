import { pb, pg } from './helpers.ts'

export const svgEmbeddedGroup = pg(
  'svgEmbedding',
  'SVG Embedding',
  'When the Image URL points to an SVG file, it can be embedded directly so its elements can reflect Item states and trigger actions. Elements must have an <code>id</code> and an <code>openhab</code> attribute to become interactive.'
)

export const svgEmbeddedParams = [
  pb('embedSvg', 'Embed SVG', 'Embed SVG image directly (default false)'),
  pb('embedSvgFlashing', 'Embed SVG Flashing in Run-Mode', 'Flashes SVG elements on hovering in run-mode as well (default false)')
]
