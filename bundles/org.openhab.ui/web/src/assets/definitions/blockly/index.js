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
import definePersistenceBlocks from './blocks-persistence'
import defineColorBlocks from './blocks-color'
import defineTextBlocks from './blocks-text'
import defineListBlocks from './blocks-list'
import defineUomBlocks from './blocks-uom'
import defineMetaBlocks from './blocks-metadata'
import defineMathBlocks from './blocks-math'

import { defineLibraries } from './libraries'

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
  definePersistenceBlocks(f7, isGraalJs)
  defineColorBlocks(f7, isGraalJs)
  defineTextBlocks(f7, isGraalJs)
  defineListBlocks(f7, isGraalJs)
  defineUomBlocks(f7, isGraalJs)
  defineMathBlocks(f7, isGraalJs)
  defineMetaBlocks(f7, isGraalJs)
  defineLibraries(libraryDefinitions)
}
