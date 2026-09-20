import { pb, pg } from './helpers.ts'

export const svgEmbeddedGroup = pg(
  'svgEmbedding',
  'SVG Embedding',
  'When the Image URL points to an SVG file, it can be embedded directly so its elements can reflect Item states and trigger actions. ' +
    'Elements must have an <code>id</code> and an <code>openhab</code> attribute to become interactive. ' +
    'The current Item state is published on each bound element so the SVG can style itself with CSS: ' +
    "<code>data-state</code> holds the raw state (e.g. <code>[data-state='OPEN'] { stroke: red }</code>), " +
    "<code>data-state-on</code> holds the normalized on/off state so numeric states like dimmer levels can be matched with <code>[data-state-on='true']</code>, " +
    'and the <code>--oh-state</code> CSS variable holds the numeric value (brightness for color Items), e.g. <code>opacity: calc(var(--oh-state) / 100)</code>.'
)

export const svgEmbeddedParams = [
  pb('embedSvg', 'Embed SVG', 'Embed SVG image directly (default false)'),
  pb('embedSvgFlashing', 'Embed SVG Flashing in Run-Mode', 'Flashes SVG elements on hovering in run-mode as well (default false)')
]
