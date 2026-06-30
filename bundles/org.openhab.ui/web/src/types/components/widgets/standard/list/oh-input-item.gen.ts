// note: this file is generated and should not be edited by hand

export interface Config {
  title?: string
  subtitle?: string
  after?: string
  icon?: string
  iconColor?: string
  iconUseState?: boolean
  name?: string
  type?: string
  inputmode?: string
  placeholder?: string
  sendButton?: boolean
  clearButton?: boolean
  outline?: boolean
  required?: boolean
  validate?: boolean
  'validate-on-blur'?: boolean
  item?: string
  useDisplayState?: boolean
  min?: number
  max?: number
  step?: number
  showTime?: boolean
  defaultValue?: string
  variable?: string
  variableKey?: string
}
import { guardConfig, guardComponent } from '@/types/widget-ts-template'

export interface Component {
  component: 'oh-input-item'
  config: Config
}

export const isConfig = (config: unknown): config is Config => {
  return guardConfig<Config>(config)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-input-item', component as Component, isConfig, defaultConfig)
}
