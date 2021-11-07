import defineItemBlocks from './blocks-items'
import defineThingsBlocks from './blocks-things'
import defineAudioBlocks from './blocks-audio'
import defineEventBusBlocks from './blocks-eventbus'
import defineLoggingBlocks from './blocks-logging'
import defineNotificationBlocks from './blocks-notifications'
import defineTimerBlocks from './blocks-timers'
import defineValueStorageBlocks from './blocks-valuestorage'

export default function (f7, data) {
  defineItemBlocks(f7)
  defineThingsBlocks(f7)
  defineAudioBlocks(f7, data.sinks, data.voices)
  defineEventBusBlocks(f7)
  defineNotificationBlocks(f7)
  defineLoggingBlocks(f7)
  defineTimerBlocks(f7)
  defineValueStorageBlocks(f7)
}
