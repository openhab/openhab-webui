export interface Config {
  item?: string
  min?: number
  max?: number
  step?: number
  vertical?: boolean
  label?: boolean
  scale?: boolean
  scaleSteps?: number
  scaleSubSteps?: number
  unit?: string
  ignoreDisplayState?: boolean
  releaseOnly?: boolean
  commandInterval?: number
  delayStateDisplay?: number
  variable?: string
  variableKey?: string
}
