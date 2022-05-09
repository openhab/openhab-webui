import { pi, pt, pb } from '../helpers.js'

export default () => [
  pi('item', 'Item', 'Item containing the address of the video'),
  pt('url', 'URL', 'URL to show (if item if not specified)'),
  pt('type', 'Type', 'Content Type of the video, for example <em>video/mp4</em> (optional)'),
  pb('hideControls', 'Hide Controls', 'Hide the control buttons of the video'),
  pb('startManually', 'Start Manually', 'Does not start playing the video automatically'),
  pt('playerType', 'Player Type', 'Select the player type (optional), defualts to Video.js').o([
    { value: 'videojs', label: 'Video.js (Dash, HLS, Others)' },
    { value: 'webrtc', label: 'WebRTC' }
  ], true, false).a(),
  pt('stunServer', 'Stun Server', 'WebRTC stun server (optional), defaults to \'stun:stun.l.google.com:19302\'').a(),
  pb('enableTrickleIce', 'Enable Trickle ICE', 'Enables Trickle ICE candiddates for WebRTC servers that support it').a()
]
