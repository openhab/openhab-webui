import defineDictionaryBlocks from './blocks-dicts'
import defineItemBlocks from './blocks-items'
import defineThingsBlocks from './blocks-things'
import defineAudioBlocks from './blocks-audio'
import defineEventBusBlocks from './blocks-eventbus'
import defineLoggingBlocks from './blocks-logging'
import defineNotificationBlocks from './blocks-notifications'
import defineTimerBlocks from './blocks-timers'
import defineValueStorageBlocks from './blocks-valuestorage'
import defineEphemerisBlocks from './blocks-ephemeris'
import defineOHBlocksScripts from './blocks-scripts'
// import defineOHBlocksPersistence from './blocks-persistence'

export default function (f7, data) {
  defineDictionaryBlocks(f7)
  defineItemBlocks(f7)
  defineThingsBlocks(f7)
  defineAudioBlocks(f7, data.sinks, data.voices)
  defineEventBusBlocks(f7)
  defineNotificationBlocks(f7)
  defineLoggingBlocks(f7)
  defineTimerBlocks(f7)
  defineValueStorageBlocks(f7)
  defineEphemerisBlocks(f7)
  defineOHBlocksScripts(f7)
  // defineOHBlocksPersistence(f7)
}
