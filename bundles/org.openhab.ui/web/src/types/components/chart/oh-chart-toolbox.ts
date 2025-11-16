export enum PresetFeatures {
  saveAsImage = 'saveAsImage',
  restore = 'restore',
  dataView = 'dataView',
  dataZoom = 'dataZoom',
  magicType = 'magicType'
}

export interface Config {
  show?: boolean
  presetFeatures: PresetFeatures
  top?: string
  bottom?: string
  left?: string
  right?: string
  width?: string
  height?: string
}
