import { pi, pt, pb, pd } from '../helpers.js'

export default () => [
  pi('item', 'Item', 'Item containing the address of the video'),
  pt('url', 'URL', 'URL to show (if item if not specified)'),
  pt('type', 'Type', 'Content Type of the video, for example <em>video/mp4</em> (optional)'),
  pb('hideControls', 'Hide Controls', 'Hide the control buttons of the video'),
  pb('startManually', 'Start Manually', 'Does not start playing the video automatically'),
  pb('startMuted', 'Start Muted', 'Mute audio output by default').a(),
  pi('posterItem', 'Poster Item', 'Image item or String item containing the URL of an image to use as a poster before the video loads').a(),
  pt('posterURL', 'Poster URL', 'URL of an image to use as a poster before the video loads (if item if not specified)').a(),
  pt('playerType', 'Player Type', 'Select the player type (optional), defualts to Video.js').o([
    { value: 'videojs', label: 'Video.js (Dash, HLS, Others)' },
    { value: 'webrtc', label: 'WebRTC' }
  ], true, false).a(),
  pt('stunServer', 'Stun Server', 'WebRTC stun server (optional), defaults to \'stun:stun.l.google.com:19302\'').a(),
  pd('candidatesTimeout', 'ICE candidates timeout', 'WebRTC ICE candidates discovery timeout length in milliseconds (optional), defaults to \'2000\', \'0\' to disable').a(),
  pb('sendAudio', 'Two Way Audio', 'Send audio to the WebRTC connection if supported (requires WebRTC player type)').a()
]
