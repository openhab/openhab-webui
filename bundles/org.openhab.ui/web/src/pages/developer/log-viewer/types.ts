export type LogLevel = 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'OFF'

export interface LogEntry {
  sequence: number
  timestamp: number
  level: LogLevel
  loggerName: string
  message: string
  stackTrace?: string
  unixtime: number
}

export interface EnrichedLogEntry extends LogEntry {
  time: string
}

export enum Color {
  red = 'red',
  green = 'green',
  blue = 'blue',
  yellow = 'yellow',
  pink = 'pink',
  orange = 'orange',
  purple = 'purple',
  deeppurple = 'deeppurple',
  lightblue = 'lightblue',
  teal = 'teal',
  lime = 'lime',
  deeporange = 'deeporange',
  gray = 'gray'
}

export interface LogHighlightFilter {
  text: string
  color: Color
  active: boolean
}
