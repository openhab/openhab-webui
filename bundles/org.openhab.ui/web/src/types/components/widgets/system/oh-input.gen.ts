// note: this file is generated and should not be edited by hand

import { guardConfig, guardComponent, type ConfigGuardFn } from '@/types/widget-ts-template'

export interface Config {
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
export interface Component {
  component: 'oh-input'
  config: Config
}

export const isConfig: ConfigGuardFn<Config> = (config: unknown): config is Config => {
  return guardConfig<Config>(config, isConfig.validationFn)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-input', component, isConfig, defaultConfig)
}
