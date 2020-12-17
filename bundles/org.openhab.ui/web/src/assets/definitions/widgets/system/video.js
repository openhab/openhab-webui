import { pi, pt, pb } from '../helpers'

export default () => [
  pi('item', 'Item', 'Item containing the address of the video'),
  pt('url', 'URL', 'URL to show (if item if not specified)'),
  pt('type', 'Type', 'Content Type of the video, for example <em>video/mp4</em> (optional)'),
  pb('hideControls', 'Hide Controls', 'Hide the control buttons of the video'),
  pb('startManually', 'Start manually', 'Does not start playing the video automatically')
]
