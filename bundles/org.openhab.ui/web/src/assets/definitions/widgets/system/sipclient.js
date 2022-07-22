import { pt, pb } from '../helpers.js'

export default () => [
  pt('height', 'Component height', 'Height of the whole component in pixels'),
  pt('websocketUrl', 'Websocket URL', 'URL of the WebRTC SIP websocket, e.g. \'wss://siphost:8089/ws\', for Android & iOS, you need wss (WebSocket secured)').r(),
  pt('domain', 'Domain', 'SIP Domain').r(),
  pt('username', 'Username', 'SIP Username').r(),
  pt('password', 'Password', 'SIP Password').r(),
  pb('enableTones', 'Enable tones', 'Enable ringback and ring tone, might cause issues with your browser, so that your call fails'),
  pb('hideCallerId', 'Hide caller id', 'Hides the username of the remote party on incoming call'),
  pt('phonebook', 'Phonebook', 'Single SIP Address (phone number) for a single call target or a comma-separated list of \'phoneNumber=name\' for multiple call targets').r(),
  pb('enableVideo', 'Enable Video', 'Enable video calling'),
  pb('enableLocalVideo', 'Enable Local Video View', 'Display the local camera on video calls'),
  pt('dtmfString', 'DTMF String', 'Display a button to send a preset DTMF string while in calls for remote doors, gates, etc...').a(),
  pb('enableSIPDebug', 'Enable SIP debugging to the console').a()
]
