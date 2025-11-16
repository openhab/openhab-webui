import {
  Orient
} from './common.ts'

export enum Type {
  continuous = 'continuous',
  piecewise = 'piecewise'
}

export enum PresetPalette {
  greenred = 'greenred',
  whiteblue = 'whiteblue',
  bluered = 'bluered'
}

export interface Config {
  show?: boolean
  min?: string
  max?: string
  type?: Type
  orient?: Orient
  calculable?: boolean
  pieces?: number
  presetPalette?: PresetPalette
  top?: string
  bottom?: string
  left?: string
  right?: string
  width?: string
  height?: string
}

export {
  Orient
}
