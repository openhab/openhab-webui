export enum StateType {
  OnOff = 'OnOff',
  OpenClosed = 'OpenClosed',
  UpDown = 'UpDown',
  PlayPause = 'PlayPause',
  RewindFastforward = 'RewindFastforward',
  HSB = 'HSB',
  Percent = 'Percent',
  Dimmer = 'Dimmer',
  Decimal = 'Decimal',
  Quantity = 'Quantity',
  Number = 'Number',
  String = 'String'
}

const SVG_STATE_TYPES = new Set<string>(Object.values(StateType))

export function isStateType(value: string | undefined): value is StateType {
  return typeof value === 'string' && SVG_STATE_TYPES.has(value)
}
