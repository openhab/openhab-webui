import { pt, pb } from '../helpers.js'

export default () => [
  pt('height', 'Component height', 'Height of the whole component in pixels'),
  pt('websocketUrl', 'Websocket URL', 'URL of the WebRTC SIP websocket, e.g. \'wss://siphost:8089/ws\'. For Android & iOS, you need wss (WebSocket secured).'),
  pt('domain', 'Domain', 'SIP Domain'),
  pt('username', 'Username', 'SIP Username'),
  pt('password', 'Password', 'SIP Password'),
  pt('sipAddress', 'SIP Address', 'SIP Address (phone number) to call'),
  pb('enableTones', 'Enable tones', 'Enable ringback and ring tone. Might cause issues with your browser, so that your call fails.'),
  pb('hideCallerId', 'Hide caller id', 'Hides the username of the remote party on incoming call'),
  pt('phonebook', 'Phonebook', 'Comma-separated list of \'value=label\' used to display names for incoming calls. Required for intercom mode.'),
  pb('intercomEnabled', 'Enable Intercom Mode', 'If enabled, you can make outgoing calls to more than one SIP user using the phonebook. ' +
    'To adjust individual settings for each device, enter edit mode and click on the gear button.')
]
