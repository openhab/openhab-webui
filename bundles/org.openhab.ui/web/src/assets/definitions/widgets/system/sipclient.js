import { pt, pn, pb } from '../helpers.js'

export default () => [
  pn('iconSize', 'Icon Size', 'Size of the icon(s) in px'),
  pt('websocketUrl', 'Websocket URL', 'Full URL of the WebRTC SIP websocket, e.g. \'wss://siphost:8089/ws\' or relative path, e.g. \'/ws\', for Android & iOS, you need wss (WebSocket secured)').r(),
  pt('domain', 'SIP Domain', '').r(),
  pt('username', 'SIP Username', ''),
  pt('password', 'SIP Password', ''),
  pb('enableTones', 'Enable tones', 'Enable ringback and ring tone. Not recommended for mobile browsers, might cause issues. Ring tone might only work after interaction with the webpage.').a(),
  pt('phonebook', 'Phonebook', 'Single SIP Address (phone number) for a single call target or a comma-separated list of \'phoneNumber=name\' for multiple call targets. Used as well to display a name instead of the number for incoming calls.').r(),
  pt('dtmfString', 'DTMF String', 'Display a button to send a preset DTMF string while in calls for remote doors, gates, etc...'),
  pb('hideCallerId', 'Hide caller id', 'Hides the username of the remote party for incoming calls.'),
  pb('enableVideo', 'Enable Video', 'Enable video calling'),
  pb('enableLocalVideo', 'Enable Local Video View', 'Display the local camera on video calls'),
  pt('defaultVideoAspectRatio', 'Default Aspect Ratio', 'Default video aspect ratio used to size the widget before video is loaded. Defaults to 4/3, 16/9 and 1 are common alternatives.').a(),
  pb('enableSIPDebug', 'Enable SIP debugging to the browser console (dev tools)').a()
]
