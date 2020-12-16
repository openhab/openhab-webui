import { pi, pt, pb } from '../helpers'

export default () => [
  pi('item', 'Item', 'Item containing the address of the video'),
  pt('url', 'URL', 'URL to show (if item if not specified)'),
  pt('type', 'Type', 'Type of the video'),
  pb('hideControls', 'Hide Controls', 'Hide the control buttons of the video'),
  pb('startManually', 'Start manually', 'Does not start playing the video automatically'),
]
