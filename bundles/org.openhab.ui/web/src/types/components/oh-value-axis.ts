import {
  NameLocation
} from './common.ts'

export interface Config {
  name?: string
  nameLocation?: NameLocation
  nameGap?: number
  nameRotate?: string
  min?: string
  max?: string
  scale?: boolean
  gridIndex?: number
}

export {
  NameLocation
}
