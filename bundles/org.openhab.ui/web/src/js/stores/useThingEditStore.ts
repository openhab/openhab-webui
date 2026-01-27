import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import fastDeepEqual from 'fast-deep-equal/es6'
import cloneDeep from 'lodash/cloneDeep'

import api from '@/js/openhab/api'

import type {
  Channel,
  ConfigDescriptionResponse,
  Firmware,
  FirmwareResponse,
  Thing,
  ThingAction,
  ThingActionsResponse,
  ThingResponse
} from '@/types/openhab'
import { f7 } from 'framework7-vue'

/**
 * The thing edit store is used by thing-details.vue to store data independent of the component's lifecycle.
 */
export const useThingEditStore = defineStore('thingEditStore', () => {
  // data
  const loading = ref(false)
  const configDirty = ref(false)
  const thingDirty = ref(false)

  const thing = ref<Thing | null>(null)
  const savedThing = ref<Thing | null>(null)
  const thingType = ref<any>(null)
  const channelTypes = ref<any>(null)
  const configDescriptions = ref<ConfigDescriptionResponse | null>(null)
  const thingActions = ref<ThingAction[]>([])
  const configStatusInfo = ref<any[]>([])
  const firmwares = ref<Firmware[]>([])

  // watch
  watch(thing, () => {
    if (!loading.value) {// ignore changes during loading
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
  }, { deep: true })

  // computed
  const editable = computed(() => thing.value?.editable)
  const isExtensible = computed(() => thingType.value?.extensibleChannelTypeIds?.length > 0)
  const hasLinkedItems = computed(() => thing.value?.channels?.find((c: Channel) => c.linkedItems?.length))

  // methods
  async function loadThingActions (thingUID: string): Promise<void> {
    try {
      const data: ThingActionsResponse = await api.get('/rest/actions/' + thingUID)
      thingActions.value = data
        .filter((a) => a.visibility === 'VISIBLE' || a.visibility === 'EXPERT')
        .filter((a) => a.inputConfigDescriptions !== undefined)
        .sort((a: ThingAction, b: ThingAction) => a.label.localeCompare(b.label))
    } catch (e: any) {
      thingActions.value = []
      if (e === 'Not Found' || e === 404) {
        console.log('No actions available for this Thing')
        return
      }
      console.error('Error loading thing actions: ' + e)
      throw e
    }
  }

  async function loadConfigDescriptions (thingUID: string): Promise<void> {
    try {
      const data: ConfigDescriptionResponse = await api.get('/rest/config-descriptions/thing:' + thingUID)
      configDescriptions.value = data
    } catch (e: any) {
      console.debug('No specific config description available for this thing, using config description from thing type instead.')
      configDescriptions.value = {
        parameterGroups: thingType.value.parameterGroups,
        parameters: thingType.value.configParameters
      } as ConfigDescriptionResponse
    }
  }

  async function loadFirmwares (thingUID: string) {
    try {
      firmwares.value = await api.get('/rest/things/' + thingUID + '/firmwares')
    } catch (e: any) {
      console.debug(`Firmware info not available for Thing ${thingUID}`)
      firmwares.value = []
    }
  }

  function load (thingUID: string, loadingFinishedCallback: (success: boolean) => void) {
    if (loading.value) return
    loading.value = true

    api.get('/rest/things/' + thingUID).then((data: ThingResponse) => {
      thing.value = data

      Promise.all([
        api.get('/rest/thing-types/' + thing.value.thingTypeUID),
        api.get('/rest/channel-types?prefixes=system,' + thing.value.thingTypeUID.split(':')[0]),
        loadThingActions(thingUID)
      ]).then((data2) => {
        thingType.value = data2[0]
        channelTypes.value = data2[1]

        Promise.all([
          loadConfigDescriptions(thingUID),
          loadFirmwares(thingUID),
          api.get('/rest/things/' + thingUID + '/config/status').then((statusData: any) => {
            configStatusInfo.value = statusData
          })
        ]).then(() => {
          savedThing.value = cloneDeep(thing.value)
          loadingFinishedCallback(true)
          loading.value = false
        })
      })
    }).catch((err) => {
      console.warn('Cannot load Thing: ' + err)
      loadingFinishedCallback(false)
      loading.value = false
    })
  }

  function save (forceSaveThing: boolean = false) {
    if (!editable.value || !thing.value) return

    let endpoint: string, payload: any, successMessage: string
    // if configDirty flag is set, assume the config has to be saved with PUT /rest/things/:thingId/config
    if (configDirty.value && !thingDirty.value && !forceSaveThing) {
      endpoint = '/rest/things/' + thing.value.UID + '/config'
      payload = thing.value.configuration
      successMessage = 'Thing configuration updated'
      // otherwise (for example, channels or label) use the regular PUT /rest/thing/:thingId
    } else {
      endpoint = '/rest/things/' + thing.value.UID
      payload = thing.value
      successMessage = 'Thing updated'
    }

    api.put(endpoint, payload).then((data) => {
      if (configDirty.value && !thingDirty.value && !forceSaveThing) configDirty.value = false
      thingDirty.value = false
      if (configDirty.value) {
        // if still dirty, save again to save the configuration
        save()
      }
      f7.toast.create({
        text: successMessage,
        destroyOnClose: true,
        closeTimeout: 2000
      }).open()
    }).catch((err) => {
      if (err === 409 || err === 'Conflict') {
        f7.toast.create({
          text: 'Cannot modify configuration of uninitialized Thing',
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
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
