import {
  GaugeType
} from '../common.ts'

export interface Config {
  item?: string
  min?: number
  max?: number
  type?: GaugeType
  value?: string
  size?: number
  bgColor?: string
  borderBgColor?: string
  borderColor?: string
  borderWidth?: string
  valueText?: string
  valueTextColor?: string
  valueFontSize?: string
  valueFontWeight?: string
  labelText?: string
  labelTextColor?: string
  labelFontSize?: string
  labelFontWeight?: string
}

export {
  GaugeType
}
