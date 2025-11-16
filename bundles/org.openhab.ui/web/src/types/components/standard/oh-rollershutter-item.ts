import {
  DirIconsStyle,
  StopIconStyle
} from '../common.ts'

export interface Config {
  title?: string
  subtitle?: string
  after?: string
  icon?: string
  iconColor?: string
  iconUseState?: boolean
  vertical?: boolean
  item?: string
  dirIconsStyle?: DirIconsStyle
  stopIconStyle?: StopIconStyle
  stateInCenter?: boolean
}

export {
  DirIconsStyle,
  StopIconStyle
}
