import { defineStore } from 'pinia'
import { nextTick, ref } from 'vue'
import openhab from '@/js/openhab'

export type TrackedItems = Map<string, ItemState>

export interface ItemState {
  state: string,
  displayState?: string,
  numericState?: number,
  unit?: string,
  type: string
}

export const useStatesStore = defineStore('states', () => {
  const itemStates = ref<TrackedItems>(new Map())
  const pendingNewItems: string[] = []
  let processingIntervalId: number | null = null

  /* global ProxyHandler:readonly */
  const handler: ProxyHandler<object> = {
    get (obj: object, prop: string | symbol): object | undefined {
      if (prop === '_keys') return Object.keys(itemStates.value)
      if (prop === '__ob__') return (obj as any).__ob__

      // to avoid the Vue devtools requesting invalid items in development
      if (
        [
          'getters',
          'effect',
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
        // Add to plain (non-reactive) pending array
        pendingNewItems.push(itemName.toString())

        // Return the previous state anyway even if it might be outdated (it will be refreshed quickly after)
        if (!itemStates.value.has(itemName)) {
          setItemState(itemName, { state: '-', type: '-' })
        }

        // Start processing interval if not already running
        if (processingIntervalId === null) {
          processingIntervalId = setInterval(() => {
            processPendingItems()
          }, 200)
        }
      }
      return itemStates.value.get(itemName)
    },
    set (_target: object, prop: string | symbol, _value: any, _receiver: any): boolean {
      setItemState(prop.toString(), { state: _value, type: '-' })
      return true
    }
  }

  const trackedItems = ref<Record<string, ItemState>>(new Proxy({}, handler))
  const trackingList = ref<Array<string>>([])
  let trackerConnectionId: string | null = null
  let trackerEventSource: EventSource | null = null
  let pendingTrackingListUpdate: boolean = false
  const keepConnectionOpen = ref<boolean>(false)
  const sseConnected = ref<boolean>(false)
  const ready = ref<boolean>(false)

  function startTrackingStates () {
    console.debug('Start tracking states')
    if (keepConnectionOpen.value && trackerEventSource) return
    clearTrackingList()
    if (trackerEventSource) {
      console.debug('Closing existing state tracker connection')
      openhab.sse.close(trackerEventSource)
      clearStateTracker()
    }
    const eventSource = openhab.sse.connectStateTracker(
      '/rest/events/states',
      (connectionId) => {
        // only one state tracker at any given time!
        trackerConnectionId = connectionId
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
    trackerEventSource = eventSource
  }

  function stopTrackingStates () {
    console.debug('Stop tracking states')
    if (keepConnectionOpen.value) return
    clearTrackingList()
    if (trackerEventSource) {
      openhab.sse.close(trackerEventSource)
    }
    clearStateTracker()
  }

  async function sendCommand (itemName: string, command: string, updateState: boolean = false) {
    if (updateState) {
      const currentState = itemStates.value.get(itemName)
      const newState : ItemState = currentState ? { ...currentState, state: command } : { state: command, type: '-' }
      setItemState(itemName, newState)
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

  function processPendingItems () {
    if (pendingNewItems.length === 0) {
      // Stop the interval if no pending items
      if (processingIntervalId !== null) {
        clearInterval(processingIntervalId)
        processingIntervalId = null
      }
      return
    }

    // Process all pending items in batch
    for (const itemName of pendingNewItems) {
      if (!isItemTracked(itemName)) addToTrackingList(itemName)
    }

    // Clear the plain array
    pendingNewItems.length = 0

    // Update the tracking list
    updateTrackingList()
  }

  function clearTrackingList () {
    trackingList.value = []
  }

  function clearStateTracker () {
    trackingList.value = []
    trackerConnectionId = null
    trackerEventSource = null
    // Clean up processing interval
    if (processingIntervalId !== null) {
      clearInterval(processingIntervalId)
      processingIntervalId = null
    }
  }

  function updateTrackingList () {
    if (!trackerConnectionId || pendingTrackingListUpdate) {
      return
    }

    pendingTrackingListUpdate = true
    nextTick(() => {
      pendingTrackingListUpdate = false
      if (!trackerConnectionId) {
        return
      }
      const trackingListJson = JSON.stringify(trackingList.value)
      console.debug(
        `Updating tracking list (${trackingList.value.length} tracked Items): ` + trackingListJson
      )

      openhab.api.postPlain(
        '/rest/events/states/' + trackerConnectionId,
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
      // Add to plain (non-reactive) pending array
      pendingNewItems.push(itemName)

      if (!itemStates.value.has(itemName)) {
        setItemState(itemName, { state: '-', type: '-' })
      }

      // Start processing interval if not already running
      if (processingIntervalId === null) {
        processingIntervalId = setInterval(() => {
          processPendingItems()
        }, 200)
      }
    }

    return itemStates.value.get(itemName)
  }

  function setItemState (itemName: string, itemState: ItemState) {
    itemStates.value.set(itemName, itemState)
    return true
  }

  return {
    trackedItems,
    itemStates,
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
