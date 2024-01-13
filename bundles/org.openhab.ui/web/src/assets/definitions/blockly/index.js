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

import { defineLibraries } from './libraries.js'

import Blockly from 'blockly'

export default function (f7, libraryDefinitions, data, isGraalJs) {
  defineDictionaryBlocks(f7, isGraalJs)
  defineDateOffsetsBlocks(f7, isGraalJs)
  defineItemBlocks(f7, isGraalJs)
  defineThingsBlocks(f7, isGraalJs)
  defineAudioBlocks(f7, isGraalJs, data.sinks, data.voices)
  defineEventBusBlocks(f7, isGraalJs)
  defineNotificationBlocks(f7, isGraalJs)
  defineLoggingBlocks(f7, isGraalJs)
  defineTimerBlocks(f7, isGraalJs)
  defineValueStorageBlocks(f7, isGraalJs)
  defineEphemerisBlocks(f7, isGraalJs)
  defineScriptsBlocks(f7, isGraalJs)
  definePersistenceBlocks(f7, isGraalJs, data.persistenceServices)
  defineColorBlocks(f7, isGraalJs)
  defineTextBlocks(f7, isGraalJs)
  defineListBlocks(f7, isGraalJs)
  defineUomBlocks(f7, isGraalJs)
  defineMathBlocks(f7, isGraalJs)
  defineMetaBlocks(f7, isGraalJs)
  defineLibraries(libraryDefinitions)
}
