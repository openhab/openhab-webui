import {
  Orient
} from '../common.ts'

export enum Type {
  slider = 'slider',
  inside = 'inside'
}

export interface Config {
  type: Type
  show?: boolean
  orient?: Orient
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
