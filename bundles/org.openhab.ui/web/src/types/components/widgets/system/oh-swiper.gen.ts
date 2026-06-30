// note: this file is generated and should not be edited by hand

export interface Config {
  pagination?: boolean
  navigation?: boolean
  scrollbar?: boolean
}
import { guardConfig, guardComponent } from '@/types/widget-ts-template'

export interface Component {
  component: 'oh-swiper'
  config: Config
}

export const isConfig = (config: unknown): config is Config => {
  return guardConfig<Config>(config)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-swiper', component as Component, isConfig, defaultConfig)
}
