import { defineStore } from 'pinia'
import { nextTick, ref } from 'vue'
import openhab from '@/js/openhab'

export const useStatesStore = defineStore('states', () => {
  const trackedItems = ref<object | null>(null)
  const items = ref<Array<string>>([])
  const trackingList = ref<Array<string>>([])
  const itemStates = ref<Map<string, object>>(new Map())
  const trackerConnectionId = ref<string | null>(null)
  const trackerEventSource = ref<EventSource | null>(null)
  const pendingTrackingListUpdate = ref<boolean>(false)
  const keepConnectionOpen = ref<boolean>(false)
  const sseConnected = ref<boolean>(false)
  const ready = ref<boolean>(false)

  /* global ProxyHandler:readonly */
  const handler: ProxyHandler<object> = {
    get (obj: object, prop: string | symbol): object | undefined {
      if (prop === '_keys') return Object.keys(itemStates.value)
      if (prop === '__ob__') return (obj as any).__ob__

      // to avoid the Vue devtools requesting invalid items in development
      if (
        [
          'getters',
          '_vm',
          'toJSON',
          '__v_isRef',
          '__v_isReadonly',
          '__v_skip',
          '__v_isShallow',
          '__v_raw',
          '__v_isReactive'
        ].indexOf(prop.toString()) >= 0
      )
        return {}
      if (typeof prop !== 'string') return {}

      const itemName = prop
      if (itemName === 'undefined') return { state: '-' }
      if (!isItemTracked(itemName)) {
        addToTrackingList(itemName.toString())

        // Return the previous state anyway even if it might be outdated (it will be refreshed quickly after)
        if (!itemStates.value.has(itemName)) {
          setItemState(itemName, { state: '-' })
        }

        updateTrackingList()
      }
      return itemStates.value.get(itemName)
    },
    set (_target: object, prop: string | symbol, _value: any, _receiver: any): boolean {
      setItemState(prop.toString(), { state: _value })
      return true
    }
  }

  trackedItems.value = new Proxy({}, handler)

  function startTrackingStates () {
    console.debug('Start tracking states')
    if (keepConnectionOpen.value && trackerEventSource.value) return
    clearTrackingList()
    if (trackerEventSource.value) {
      console.debug('Closing existing state tracker connection')
      openhab.sse.close(trackerEventSource.value)
      clearStateTracker()
    }
    const eventSource = openhab.sse.connectStateTracker(
      '/rest/events/states',
      (connectionId) => {
        // only one state tracker at any given time!
        trackerConnectionId.value = connectionId
        const trackingListJson = JSON.stringify(trackingList.value)
        console.debug(
          `Setting initial tracking list (${trackingList.value.length} tracked Items): ` +
          trackingListJson
        )
        openhab.api.postPlain(
          '/rest/events/states/' + connectionId,
          trackingListJson,
          'text/plain',
          'application/json',
          null
        )
        sseConnected.value = true
        ready.value = true
      },
      (updates) => {
        for (const item in updates) {
          setItemState(item, updates[item])
        }
      },
      () => {
        sseConnected.value = false
      },
      (healthy) => {
        sseConnected.value = healthy
      }
    )
    trackerEventSource.value = eventSource
  }

  function stopTrackingStates () {
    console.debug('Stop tracking states')
    if (keepConnectionOpen.value) return
    clearTrackingList()
    if (trackerEventSource.value) {
      openhab.sse.close(trackerEventSource.value)
    }
    clearStateTracker()
  }

  async function sendCommand (itemName: string, command: string, updateState: boolean = false) {
    if (updateState) {
      setItemState(itemName, { state: command })
    }
    return openhab.api.postPlain(
      '/rest/items/' + itemName,
      command,
      'text/plain',
      'text/plain',
      null
    )
  }

  function isItemTracked (itemName: string) {
    return trackingList.value.includes(itemName)
  }

  function addToTrackingList (itemName: string) {
    trackingList.value.push(itemName)
  }

  function clearTrackingList () {
    trackingList.value = []
  }

  function clearStateTracker () {
    trackingList.value = []
    trackerConnectionId.value = null
    trackerEventSource.value = null
  }

  function updateTrackingList () {
    if (!trackerConnectionId.value || pendingTrackingListUpdate.value) {
      return
    }

    pendingTrackingListUpdate.value = true
    nextTick(() => {
      pendingTrackingListUpdate.value = false
      if (!trackerConnectionId.value) {
        return
      }
      const trackingListJson = JSON.stringify(trackingList.value)
      console.debug(
        `Updating tracking list (${trackingList.value.length} tracked Items): ` + trackingListJson
      )

      openhab.api.postPlain(
        '/rest/events/states/' + trackerConnectionId.value,
        trackingListJson,
        'text/plain',
        'application/json',
        null
      )
    })
  }

  function getTrackedItem (itemName: string): object | undefined {
    if (itemName === 'undefined') return { state: '-' }
    if (!isItemTracked(itemName)) {
      addToTrackingList(itemName)

      if (!itemStates.value.has(itemName)) {
        setItemState(itemName, { state: '-' })
      }

      updateTrackingList()
    }

    return itemStates.value.get(itemName)
  }

  function setItemState (itemName: string, itemState: object) {
    itemStates.value.set(itemName, itemState)
    return true
  }

  return {
    trackedItems,
    items,
    trackingList,
    itemStates,
    trackerConnectionId,
    trackerEventSource,
    pendingTrackingListUpdate,
    keepConnectionOpen,
    sseConnected,
    ready,

    startTrackingStates,
    stopTrackingStates,
    setItemState,
    isItemTracked,
    getTrackedItem,
    addToTrackingList,
    updateTrackingList,
    sendCommand
  }
})
