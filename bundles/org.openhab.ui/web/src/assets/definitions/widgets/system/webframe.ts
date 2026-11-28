import { pb, pn, pt } from '../helpers.ts'

export default () => [
  pt('src', 'Source URL', 'URL to show in the frame'),
  pn('height', 'Height', 'Height of the frame (by default 300px)'),
  pb(
    'openhabSession',
    'Reuse openHAB sign-in',
    'Start a session with a participating servlet on the same HTTPS origin before loading the frame'
  )
]
