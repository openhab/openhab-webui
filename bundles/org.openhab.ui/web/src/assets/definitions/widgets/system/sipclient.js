import { pt } from '../helpers.js'

export default () => [
  pt('websocketUrl', 'Websocket URL', 'URL of the WebRTC SIP websocket, e.g. \'wss://siphost:8089/ws\''),
  pt('domain', 'Domain', 'SIP Domain'),
  pt('username', 'Username', 'SIP Username'),
  pt('password', 'Password', 'SIP Password'),
  pt('sipAddress', 'Address', 'SIP Address (phone number) to call')
]
