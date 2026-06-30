// note: this file is generated and should not be edited by hand

export interface Config {
  item?: string
  min?: number
  max?: number
  step?: number
  offset?: number
  buttonsOnly?: boolean
  enableInput?: boolean
  small?: boolean
  large?: boolean
  fill?: boolean
  raised?: boolean
  round?: boolean
  autorepeat?: boolean
  autorepeatDynamic?: boolean
  variable?: string
  variableKey?: string
}
import { guardConfig, guardComponent } from '@/types/widget-ts-template'

export interface Component {
  component: 'oh-stepper'
  config: Config
}

export const isConfig = (config: unknown): config is Config => {
  return guardConfig<Config>(config)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-stepper', component as Component, isConfig, defaultConfig)
}
