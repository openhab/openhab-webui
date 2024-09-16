import defineDictionaryBlocks from './blocks-dicts.js'
import defineDateOffsetsBlocks from './blocks-dateoffsets.js'
import defineItemBlocks from './blocks-items.js'
import defineThingsBlocks from './blocks-things.js'
import defineAudioBlocks from './blocks-audio.js'
import defineEventBusBlocks from './blocks-eventbus.js'
import defineLoggingBlocks from './blocks-logging.js'
import defineNotificationBlocks from './blocks-notifications.js'
import defineTimerBlocks from './blocks-timers.js'
import defineValueStorageBlocks from './blocks-valuestorage.js'
import defineEphemerisBlocks from './blocks-ephemeris.js'
import defineScriptsBlocks from './blocks-scripts.js'
import definePersistenceBlocks from './blocks-persistence.js'
import defineColorBlocks from './blocks-color.js'
import defineTextBlocks from './blocks-text.js'
import defineListBlocks from './blocks-list.js'
import defineUomBlocks from './blocks-uom.js'
import defineMetaBlocks from './blocks-metadata.js'
import defineMathBlocks from './blocks-math.js'
import defineHttpBlocks from './blocks-http.js'
import defineLogicBlocks from './blocks-logic.js'

import { defineLibraries } from './libraries.js'

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
  defineScriptsBlocks(f7, data.transformationServices)
  definePersistenceBlocks(f7, data.persistenceServices)
  defineColorBlocks(f7)
  defineTextBlocks(f7)
  defineListBlocks(f7)
  defineUomBlocks(f7)
  defineMathBlocks(f7)
  defineMetaBlocks(f7)
  defineHttpBlocks(f7)
  defineLogicBlocks(f7)
  defineLibraries(libraryDefinitions)
}
