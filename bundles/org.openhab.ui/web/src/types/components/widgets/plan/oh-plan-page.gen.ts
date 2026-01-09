// note: this file is generated and should not be edited by hand

export enum BackgroundColor {
  none = '',
  white = 'white',
  black = 'black',
  blackwhite = 'blackwhite'
}

export enum TooltipColor {
  white = 'white',
  black = 'black',
  blackwhite = 'blackwhite'
}

export interface Config {
  imageUrl?: string
  imageWidth?: number
  imageHeight?: number
  noZoomOrDrag?: boolean
  noZoomAnimation?: boolean
  noMarkerZoomAnimation?: boolean
  backgroundColor?: BackgroundColor
  darkModeInvert?: boolean
  tooltipColor?: TooltipColor
}
