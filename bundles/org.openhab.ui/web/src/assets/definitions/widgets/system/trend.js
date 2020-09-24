import { pi, pt } from '../helpers'

export default () => [
  pi('trendItem', 'Trend Line Item', 'Item to show as a trend line in the background'),
  pt('trendStrokeWidth', 'Trend Stroke Width', 'Thickness of the trend line').a(),
  pt('trendWidth', 'Trend Line Width', 'Width of the trend line (leave blank to set automatically)').a(),
  pt('trendGradient', 'Trend Line Gradient', 'Colors of the trend line (see <a target="_blank" class="external text-color-blue" href="https://github.com/QingWei-Li/vue-trend#props">vue-trend</a>)').a()
]
