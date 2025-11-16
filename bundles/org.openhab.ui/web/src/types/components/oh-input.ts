export interface Config {
  name?: string
  type?: string
  inputmode?: string
  placeholder?: string
  sendButton?: boolean
  clearButton?: boolean
  outline?: boolean
  required?: boolean
  validate?: boolean
  'validate-on-blur'?: boolean
  item?: string
  useDisplayState?: boolean
  min?: number
  max?: number
  step?: number
  showTime?: boolean
  defaultValue?: string
  variable?: string
  variableKey?: string
}
