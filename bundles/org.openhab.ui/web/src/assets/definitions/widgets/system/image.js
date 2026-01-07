import { pi, pt, pb, pn } from '../helpers.js'

export default () => [
  pi('item', 'Item', 'Image item to show - preferred if the image changes'),
  pt('url', 'URL', 'URL to show (if item if not specified)'),
  pb('lazy', 'Lazy Load', 'Load the image only when in view'),
  pb(
    'lazyFadeIn',
    'Lazy Load Fade-in',
    'Transition the image with a fade-in effect after it has loaded'
  ),
  pn('refreshInterval', 'Refresh Interval', 'Refresh interval in milliseconds')
]
