// note: this file is generated and should not be edited by hand

import { guardConfig, guardComponent, type ConfigGuardFn } from '@/types/widget-ts-template'

export enum Width {

}

export enum Xsmall {

}

export enum Small {

}

export enum Medium {

}

export enum Large {

}

export enum Xlarge {

}

export interface Config {
  width?: Width
  xsmall?: Xsmall
  small?: Small
  medium?: Medium
  large?: Large
  xlarge?: Xlarge
}
export interface Component {
  component: 'oh-grid-col'
  config: Config
}

export const isConfig: ConfigGuardFn<Config> = (config: unknown): config is Config => {
  return guardConfig<Config>(config, isConfig.validationFn)
}

export const isComponent = (component: unknown, defaultConfig?: Config): component is Component => {
  return guardComponent<Component, Config>('oh-grid-col', component, isConfig, defaultConfig)
}
