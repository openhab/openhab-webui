import {
  Item,
  BackgroundColor
} from '../common.ts'

export interface Config {
  item?: Item
  title?: string
  subtitle?: string
  backgroundColor?: BackgroundColor
  backgroundImage?: string
  invertText?: boolean
}

export {
  Item,
  BackgroundColor
}
