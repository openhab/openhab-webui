import {
  PlayerType
} from '../common.ts'

export interface Config {
  title?: string
  footer?: string
  noBorder?: boolean
  noShadow?: boolean
  outline?: boolean
  item?: string
  url?: string
  type?: string
  hideControls?: boolean
  startManually?: boolean
  startMuted?: boolean
  posterItem?: string
  posterURL?: string
  playerType?: PlayerType
  stunServer?: string
  candidatesTimeout?: number
  sendAudio?: boolean
}

export {
  PlayerType
}
