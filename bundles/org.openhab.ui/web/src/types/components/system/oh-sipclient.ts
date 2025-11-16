export interface Config {
  iconSize?: number
  websocketUrl: string
  domain: string
  username?: string
  password?: string
  authorizationUser?: string
  enableTones?: boolean
  phonebook: string
  dtmfString?: string
  hideCallerId?: boolean
  enableVideo?: boolean
  enableLocalVideo?: boolean
  defaultVideoAspectRatio?: string
  disableRegister?: boolean
  autoAnswer?: string
  autoDial?: string
  sipStateItem?: string
  enableSIPDebug?: boolean
}
