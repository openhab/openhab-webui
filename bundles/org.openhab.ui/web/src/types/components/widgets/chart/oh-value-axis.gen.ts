// note: this file is generated and should not be edited by hand

import {
  NameLocation
} from '../common.gen.ts'

export enum Split {
  line = 'line',
  area = 'area',
  minor = 'minor'
}

export interface Config {
  name?: string
  nameLocation?: NameLocation
  nameGap?: number
  nameRotate?: string
  min?: string
  max?: string
  scale?: boolean
  split?: Split[]
  gridIndex?: number
}

export {
  NameLocation
}
