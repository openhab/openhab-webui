// note: this file is generated and should not be edited by hand

export interface Config {
  title?: string
  footer?: string
  noBorder?: boolean
  noShadow?: boolean
  outline?: boolean
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
import { guardConfig, guardComponent } from '@/types/widget-ts-template'

export interface Component {
  component: 'oh-sipclient-card'
  config: Config
}

export const isConfig = (config: unknown): config is Config => {
  return guardConfig<Config>(config)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-sipclient-card', component as Component, isConfig, defaultConfig)
}
