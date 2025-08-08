import { pt, pn, pb, pi } from '../helpers.js'

export default () => [
  pn('iconSize', 'Icon Size', 'Size of the icon(s) in px'),
  pt('websocketUrl', 'Websocket URL', 'Full URL of the WebRTC SIP websocket, e.g. <code>wss://siphost:8089/ws</code> or relative path, e.g. <code>/ws</code>, for Android & iOS, you need <code>wss</code> (WebSocket secured)').r(),
  pt('domain', 'SIP Domain', '').r(),
  pt('username', 'SIP Username', ''),
  pt('password', 'SIP Password', ''),
  pt('authorizationUser', 'Authorization User', 'User name used for SIP authentication, only required if different from the SIP username.'),
  pb('enableTones', 'Enable tones', 'Enable ringback and ring tone. Not recommended for mobile browsers, might cause issues. Ring tone might only work after interaction with the webpage.').a(),
  pt('phonebook', 'Phonebook', 'Single SIP Address (phone number) for a single call target or a comma-separated list of <code>phoneNumber=name</code> for multiple call targets. Used as well to display a name instead of the number for incoming calls.').r(),
  pt('dtmfString', 'DTMF String', 'Display a button to send a preset DTMF string while in calls for remote doors, gates, etc...'),
  pb('hideCallerId', 'Hide caller id', 'Hides the username of the remote party for incoming calls.'),
  pb('enableVideo', 'Enable Video', 'Enable video calling'),
  pb('enableLocalVideo', 'Enable Local Video View', 'Display the local camera on video calls'),
  pt('defaultVideoAspectRatio', 'Default Aspect Ratio', 'Default video aspect ratio used to size the widget before video is loaded. Defaults to 4/3, 16/9 and 1 are common alternatives.').a(),
  pb('disableRegister', 'Disable REGISTER', 'SIP registration can be disabled in case you only want to initiate calls, but not receive calls with the SIP widgets.').a(),
  pt('autoAnswer', 'Auto Answer', 'Automatically answer an incoming call from one of the comma delimited SIP addresses (<code>userInfo@hostname</code>, <code>userInfo</code>, ...) or use * for all incoming calls.').a(),
  pt('autoDial', 'Auto Dial', 'Automatically dial the SIP address when loaded').a(),
  pi('sipStateItem', 'SIP State Item', 'String Item to publish the current SIP connection state to the openHAB server and make it accessible from rules etc.').a(),
  pb('enableSIPDebug', 'Enable SIP Debug', 'Enable SIP debugging to the browser console (dev tools)').a()
]
