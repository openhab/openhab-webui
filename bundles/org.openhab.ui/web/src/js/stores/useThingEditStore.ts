import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import fastDeepEqual from 'fast-deep-equal/es6'
import cloneDeep from 'lodash/cloneDeep'

import api from '@/js/openhab/api'

import type { ConfigDescriptionParameter, ConfigDescriptionResponse } from '@/types/openhab'

export const useThingEditStore = defineStore('thingEditStore', () => {
  // data
  const loading = ref(false)
  const configDirty = ref(false)
  const thingDirty = ref(false)

  const thing = ref<any>(null)
  const savedThing = ref<any>(null)
  const thingType = ref<any>(null)
  const channelTypes = ref<any>(null)
  const configDescriptions = ref<ConfigDescriptionResponse | null>(null)
  const thingActions = ref<any[]>([])
  const configStatusInfo = ref<any[]>([])
  const firmwares = ref<any[]>([])

  // watch
  watch(thing, () => {
    if (!loading.value) {// ignore changes during loading
      // create object clone to be able to delete the status part
      // which can change from eventsource but doesn't mean a thing modification
      let thingClone = cloneDeep(thing.value)
      let savedThingClone = cloneDeep(savedThing.value)

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
  const isExtensible = computed(() => thingType.value.extensibleChannelTypeIds?.length > 0)
  const hasLinkedItems = computed(() => thing.value?.thing?.channels?.find((c: any) => c.linkedItems?.length))

  // methods
  function loadThingActions (thingUID: string) {
    return api.get('/rest/actions/' + thingUID).then((data: any) => {
      thingActions.value = data
        .filter((a: any) => a.visibility === 'VISIBLE')
        .filter((a: any) => a.inputConfigDescriptions !== undefined)
        .sort((a: any, b: any) => a.label.localeCompare(b.label))
      return Promise.resolve()
    }).catch((e: any) => {
      if (e === 'Not Found' || e === 404) {
        console.log('No actions available for this Thing')
        return Promise.resolve()
      }
      console.error('Error loading thing actions: ' + e)
      return Promise.reject(e)
    })
  }

  function loadConfigDescriptions (thingUID: string) {
    return api.get('/rest/config-descriptions/thing:' + thingUID).then((data: ConfigDescriptionResponse) => {
      configDescriptions.value = data

      // TODO: Can be removed once the config actions have been removed from all add-ons
      configDescriptions.value.parameters = configDescriptions.value.parameters.filter((p: ConfigDescriptionParameter) => p.groupName !== 'actions')

      return Promise.resolve()
    }).catch(() => {
      console.debug('No specific config description available for this thing, using config description from thing type instead.')
      configDescriptions.value = {
        parameterGroups: thingType.value.parameterGroups,
        parameters: thingType.value.configParameters,
      } as ConfigDescriptionResponse
      return Promise.resolve()
    })
  }

  function loadFirmwares (thingUID: string) {
    return api.get('/rest/things/' + thingUID + '/firmwares').then((firmwareData: any) => {
      firmwares.value = firmwareData
      return Promise.resolve()
    }).catch(() => {
      console.debug(`Firmware info not available for Thing ${thingUID}`)
      return Promise.resolve()
    })
  }

  function load (thingUID: string, loadingFinishedCallback: (success: boolean) => void) {
    if (loading.value) return
    loading.value = true

    api.get('/rest/things/' + thingUID).then((data: any) => {
      thing.value = data

      const promises = [api.get('/rest/thing-types/' + thing.value.thingTypeUID),
        api.get('/rest/channel-types?prefixes=system,' + thing.value.thingTypeUID.split(':')[0]),
        loadThingActions(thingUID)]

      Promise.all(promises).then((data2) => {
        thingType.value = data2[0]
        channelTypes.value = data2[1]

        Promise.all([loadConfigDescriptions(thingUID), loadFirmwares(thingUID),
          api.get('/rest/things/' + thingUID + '/config/status').then((statusData: any) => {
            configStatusInfo.value = statusData
          })
        ]).then(() => {
          savedThing.value = cloneDeep(thing.value)
          loadingFinishedCallback(true)
          loading.value = false
        })
      }).catch((err) => {
        console.warn('Cannot load Thing: ' + err)
        loadingFinishedCallback(false)
      })
    })
  }

  return {
    configDirty,
    thingDirty,
    thing,
    savedThing,
    thingType,
    channelTypes,
    configDescriptions,
    thingActions,
    configStatusInfo,
    firmwares,

    editable,
    isExtensible,
    hasLinkedItems,

    load
  }
})
