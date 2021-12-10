import defineDictionaryBlocks from './blocks-dicts'
import defineDateOffsetsBlocks from './blocks-dateoffsets'
import defineItemBlocks from './blocks-items'
import defineThingsBlocks from './blocks-things'
import defineAudioBlocks from './blocks-audio'
import defineEventBusBlocks from './blocks-eventbus'
import defineLoggingBlocks from './blocks-logging'
import defineNotificationBlocks from './blocks-notifications'
import defineTimerBlocks from './blocks-timers'
import defineValueStorageBlocks from './blocks-valuestorage'
import defineEphemerisBlocks from './blocks-ephemeris'
import defineScriptsBlocks from './blocks-scripts'
import definePeristenceBlocks from './blocks-persistence'
import { defineLibraries } from './libraries'

import Blockly from 'blockly'

export default function (f7, libraryDefinitions, data) {
  defineDictionaryBlocks(f7)
  defineDateOffsetsBlocks(f7)
  defineItemBlocks(f7)
  defineThingsBlocks(f7)
  defineAudioBlocks(f7, data.sinks, data.voices)
  defineEventBusBlocks(f7)
  defineNotificationBlocks(f7)
  defineLoggingBlocks(f7)
  defineTimerBlocks(f7)
  defineValueStorageBlocks(f7)
  defineEphemerisBlocks(f7)
  defineScriptsBlocks(f7)
  definePeristenceBlocks(f7)
  defineLibraries(libraryDefinitions)
}
