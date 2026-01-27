import { f7 } from 'framework7-vue'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import fastDeepEqual from 'fast-deep-equal/es6'
import cloneDeep from 'lodash/cloneDeep'

import * as api from '@/api'

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
  const firmwares = ref<api.FirmwareStatus | null>(null)

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
  async function loadThingActions(thingUID: string): Promise<void> {
    // getAvailableActionsForThing will return 404 if no actions are available for this thing (204 would be better response)
    const data = await api.getAvailableActionsForThing({ thingUID }).catch((e) => {
      if (e.response?.statusText === 'Not Found' || e.response?.status === 404) {
        console.log('No actions available for this Thing')
        return
      }
      throw e
    })

    if (!data) {
      return
    }

    thingActions.value = data
      .filter((a) => a.visibility === 'VISIBLE' || a.visibility === 'EXPERT')
      .filter((a) => a.inputConfigDescriptions !== undefined)
      .sort((a, b) => (a.label || '').localeCompare(b.label || ''))
  }

  async function loadConfigDescriptions(thingUID: string): Promise<void> {
    // getConfigDescriptionByUri will return 404 if no specific config description is available for this thing
    // if an error or no specific description is available, try to use the config description from the Thing Type
    try {
      const data = await api.getConfigDescriptionByUri({ uri: 'thing:' + thingUID }).catch((e) => {
        if (e.response?.statusText === 'Not Found' || e.response?.status === 404) {
          return
        }
        throw e
      })
      configDescriptions.value =  data || null
    } finally {
      if (configDescriptions.value) return
      if (thingType.value && thingType.value.configParameters && thingType.value.parameterGroups) {
        console.debug('No specific config description available for this thing, using config description from thing type instead.')
        configDescriptions.value = {
          parameterGroups: thingType.value.parameterGroups,
          parameters: thingType.value.configParameters
        }
      } else {
        console.debug('No config description available for this thing.')
      }
    }
  }

  async function loadFirmwares(thingUID: string) {
    // getThingFirmwareStatus will return 204 if no firmware info is available for this thing
    api
      .getThingFirmwareStatus({ thingUID })
      .then((data) => {
        if (data && Object.keys(data).length > 0) {
          firmwares.value = data
        }
      })
  }

  function load(thingUID: string, loadingFinishedCallback: (success: boolean) => void) {
    if (loading.value) return
    loading.value = true

    // reset data to initial state
    thing.value = null
    thingType.value = null
    channelTypes.value = null
    thingActions.value = null
    configDescriptions.value = null
    configStatusInfo.value = null
    firmwares.value = null

    api
      .getThingById({ thingUID })
      .then((data) => {
        if (!data) {
          console.warn('Thing not found')
          loadingFinishedCallback(false)
          loading.value = false
          return
        }

        thing.value = data

        Promise.allSettled([
          // if no typeType found, it will respond with 204
          api.getThingTypeById({ thingTypeUID: thing.value!.thingTypeUID }).then((data) => {
            if (data && Object.keys(data).length > 0) {
              thingType.value = data
            }
          }),
          api.getChannelTypes({ prefixes: 'system,' + thing.value.thingTypeUID.split(':')[0] }).then((data) => channelTypes.value = data || []),
          loadThingActions(thingUID)
        ]).then((results) => {
          Promise.allSettled([
            loadConfigDescriptions(thingUID),
            loadFirmwares(thingUID),
            api.getThingConfigStatus({ thingUID }).then((data) => {
              configStatusInfo.value = data ?? null
            })
          ]).then((results) => {
            savedThing.value = cloneDeep(thing.value)
            loadingFinishedCallback(true)
            loading.value = false
          })
        })
      })
      .catch((err) => {
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
