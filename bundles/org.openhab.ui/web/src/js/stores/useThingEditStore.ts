import { f7 } from 'framework7-vue'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import fastDeepEqual from 'fast-deep-equal/es6'
import cloneDeep from 'lodash/cloneDeep'

import * as api from '@/api'
import { getErrorMessage } from '../hey-api'

/**
 * The thing edit store is used by thing-details.vue to store data independent of the component's lifecycle.
 */
export const useThingEditStore = defineStore('thingEditStore', () => {
  // data
  const loading = ref(false)
  const configDirty = ref(false)
  const thingDirty = ref(false)

  const thing = ref<api.EnrichedThing | null>(null)
  const savedThing = ref<api.EnrichedThing | null>(null)
  const thingType = ref<api.ThingType | null>(null)
  const channelTypes = ref<api.ChannelType[] | null>(null)
  const configDescriptions = ref<api.ConfigDescription | null>(null)
  const thingActions = ref<api.ThingAction[] | null>(null)
  const configStatusInfo = ref<api.ConfigStatusMessage[] | null>(null)
  const firmwares = ref<api.Firmware[] | null>(null)

  // watch
  watch(
    thing,
    () => {
      if (!loading.value) {
        // ignore changes during loading
        // create object clone to be able to delete the status part
        // which can change from eventsource but doesn't mean a thing modification
        let thingClone: any = cloneDeep(thing.value)
        let savedThingClone: any = cloneDeep(savedThing.value)
        if (!thingClone || !savedThingClone) return

        // check if the configuration has changed between the thing and the original/saved version
        configDirty.value = !fastDeepEqual(thingClone.configuration, savedThingClone.configuration)

        // check if the rest of the thing has changed between the thing and the original/saved version
        delete thingClone.statusInfo
        delete thingClone.configuration
        delete savedThingClone.statusInfo
        delete savedThingClone.configuration
        thingDirty.value = !fastDeepEqual(thingClone, savedThingClone)
      }
    },
    { deep: true }
  )

  // computed
  const editable = computed(() => thing.value?.editable)
  const isExtensible = computed(() => (thingType?.value?.extensibleChannelTypeIds?.length ?? 0) > 0)
  const hasLinkedItems = computed(() => thing.value?.channels?.find((c) => c.linkedItems?.length))

  // methods
  function applyThingTypeConfigDescriptions(): boolean {
    if (thingType.value && thingType.value.configParameters && thingType.value.parameterGroups) {
      console.debug('No specific config description available for this thing, using config description from thing type instead.')
      configDescriptions.value = {
        parameterGroups: thingType.value.parameterGroups,
        parameters: thingType.value.configParameters
      }
      return true
    }
    return false
  }

  function load(thingUID: string, loadingFinishedCallback: (success: boolean) => void) {
    if (loading.value) return
    loading.value = true

    api
      .getThingById({ thingUID })
      .then((data) => {
        if (!data) {
          thing.value = null
          console.warn('Thing not found')
          loadingFinishedCallback(false)
          loading.value = false
          return
        }

        thing.value = data

        Promise.allSettled([
          api.getThingTypeById({ thingTypeUID: thing.value.thingTypeUID }),
          api.getChannelTypes({ prefixes: 'system,' + thing.value.thingTypeUID.split(':')[0] }),
          api.getAvailableActionsForThing({ thingUID }),
          api.getConfigDescriptionByUri({ uri: 'thing:' + thingUID }),
          api.getAvailableFirmwaresForThing({ thingUID }),
          api.getThingConfigStatus({ thingUID })
        ]).then(([thingTypeResult, channelTypesResult, actionsResult, configDescResult, firmwareResult, configStatusResult]) => {
          if (thingTypeResult.status === 'fulfilled') {
            thingType.value = thingTypeResult.value && Object.keys(thingTypeResult.value).length > 0 ? thingTypeResult.value : null
          } else {
            thingType.value = null
            const message = `Cannot load thing-type '${data.thingTypeUID}'`
            console.error(message, thingTypeResult.reason)
            f7.dialog.alert(message + ': ' + getErrorMessage(thingTypeResult.reason))
          }

          if (channelTypesResult.status === 'fulfilled') {
            channelTypes.value = channelTypesResult.value ?? []
          } else {
            channelTypes.value = null
            const message = `Cannot load channel-types for thing-type '${data.thingTypeUID}'`
            console.error(message, channelTypesResult.reason)
            f7.dialog.alert(message + ': ' + getErrorMessage(channelTypesResult.reason))
          }

          if (actionsResult.status === 'fulfilled') {
            if (!actionsResult.value || Array.isArray(actionsResult.value) === false) {
              thingActions.value = []
            } else {
              thingActions.value = actionsResult.value
                .filter((a) => a.visibility === 'VISIBLE' || a.visibility === 'EXPERT')
                .filter((a) => a.inputConfigDescriptions !== undefined)
                .sort((a, b) => (a.label || '').localeCompare(b.label || ''))
            }
          } else {
            thingActions.value = []
            console.error(`Cannot load '${thingUID}' thing actions`, actionsResult.reason)
          }

          if (configDescResult.status === 'fulfilled') {
            if (configDescResult.value && Object.keys(configDescResult.value).length > 0) {
              configDescriptions.value = configDescResult.value
            } else {
              // no specific config description available for this thing, try to use the thing type config description
              if (!applyThingTypeConfigDescriptions()) {
                console.debug(`No config description available for Thing '${thingUID}'`)
              }
            }
          } else {
            if (!applyThingTypeConfigDescriptions()) {
              configDescriptions.value = null
            }
            console.error(`Cannot load '${thingUID}' config descriptions`, configDescResult.reason)
          }

          if (firmwareResult.status === 'fulfilled') {
            firmwares.value = firmwareResult.value && Object.keys(firmwareResult.value).length > 0 ? firmwareResult.value : []
          } else {
            firmwares.value = null
            console.error(`Cannot load '${thingUID}' firmwares`, firmwareResult.reason)
          }

          if (configStatusResult.status === 'fulfilled') {
            configStatusInfo.value = configStatusResult.value ?? null
          } else {
            configStatusInfo.value = null
            console.error(`Cannot load '${thingUID}' config status`, configStatusResult.reason)
          }

          savedThing.value = cloneDeep(thing.value)
          loadingFinishedCallback(true)
          loading.value = false
        })
      })
      .catch((err) => {
        thing.value = null
        thingType.value = null
        channelTypes.value = null
        thingActions.value = []
        configDescriptions.value = null
        configStatusInfo.value = null
        firmwares.value = null
        let message = `Cannot load Thing '${thingUID}': ${err}`
        console.error(message)
        f7.dialog.alert(message)
        loadingFinishedCallback(false)
        loading.value = false
      })
  }

  function save(forceSaveThing: boolean = false) {
    if (!editable.value || !thing.value) return

    let endpoint: string, payload: any, successMessage: string
    let promise: Promise<api.EnrichedThing | undefined>
    // if configDirty flag is set, assume the config has to be saved with PUT /rest/things/:thingId/config
    if (configDirty.value && !thingDirty.value && !forceSaveThing) {
      successMessage = 'Thing configuration updated'
      // otherwise (for example, channels or label) use the regular PUT /rest/thing/:thingId
      promise = api.updateThingConfig({ thingUID: thing.value.UID, body: thing.value.configuration })
    } else {
      successMessage = 'Thing updated'
      promise = api.updateThing({ thingUID: thing.value.UID, thing: thing.value })
    }

    promise
      .then((data) => {
        if (configDirty.value && !thingDirty.value && !forceSaveThing) configDirty.value = false
        thingDirty.value = false
        if (configDirty.value) {
          // if still dirty, save again to save the configuration
          save()
        }
        f7.toast
          .create({
            text: successMessage,
            destroyOnClose: true,
            closeTimeout: 2000
          })
          .open()
      })
      .catch((err) => {
        if (err.response?.status === 409 || err.response?.statusText === 'Conflict') {
          f7.toast
            .create({
              text: 'Cannot modify configuration of uninitialized Thing',
              destroyOnClose: true,
              closeTimeout: 2000
            })
            .open()
        }
      })
  }

  return {
    configDirty,
    thingDirty,

    thing,
    thingType,
    channelTypes,
    configDescriptions,
    thingActions,
    configStatusInfo,
    firmwares,

    editable,
    isExtensible,
    hasLinkedItems,

    load,
    save
  }
})
