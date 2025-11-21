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

const UndefinedItemState: ItemState = { state: '-', type: '-' } 

const PendingItemsProcessingInterval = 100

const INVALID_PROPS = new Set([
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
])

export const useStatesStore = defineStore('states', () => {
  const itemStates = ref<TrackedItems>(new Map())
  const pendingNewItems = new Set<string>()
  let processingIntervalId: number | null = null


  function ensureItemTracking(itemName: string): ItemState {
    if (itemName === 'undefined') return UndefinedItemState
    
    let itemState = itemStates.value.get(itemName)
    if (!isItemTracked(itemName)) {
      pendingNewItems.add(itemName)
      
      if (!itemState) {
        itemState = UndefinedItemState
        setItemState(itemName, itemState)
      }

      // Start processing interval if not already running
      if (processingIntervalId === null) {
        processingIntervalId = setInterval(() => {
          processPendingItems()
        }, PendingItemsProcessingInterval)
      }
    }
    
    return itemState!
  }

  /* global ProxyHandler:readonly */
  const handler: ProxyHandler<Record<string, ItemState>> = {
    get (obj: Record<string, ItemState>, prop: string | symbol): ItemState {
      if (prop === '_keys') return Object.keys(itemStates.value) as any
      if (prop === '__ob__') return (obj as any).__ob__

      // to avoid the Vue devtools requesting invalid items in development
      if (INVALID_PROPS.has(prop.toString())) return {} as any
      if (typeof prop !== 'string') return {} as any

      const itemName = prop
      return ensureItemTracking(itemName)
    },
    set (_target: Record<string, ItemState>, prop: string | symbol, value: any, _receiver: Record<string, ItemState>): boolean {
      setItemState(prop.toString(), { state: value, type: '-' })
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

  /**
   * Processes pending to be added items to the tracking list.
   * This function is invoked by an interval to process pending Items in batches.
   *
   * When an Item state of an item is requested and not available, the Item needs to be added to the tracking list.
   * This is done in batches because every modification of the tracking list triggers a lot of reactivity,
   * causing major performance issues when many items are requested in a short time frame.
   */
  function processPendingItems () {
    if (pendingNewItems.size === 0) {
      if (processingIntervalId !== null) {
        clearInterval(processingIntervalId)
        processingIntervalId = null
      }
      return
    }

    // use Set to allow O(1) lookup for tracking list, Set creation takes O(n) time
    // overall reduction from O(n * m) (m times O(n) array lookup) to O(n + m) (O(n) Set creation + m times O(1) lookup)
    const trackedItems = new Set(trackingList.value)
    for (const itemName of pendingNewItems) {
      if (!trackedItems.has(itemName)) addToTrackingList(itemName)
    }

    pendingNewItems.clear()
    updateTrackingList()
  }

  function clearTrackingList () {
    trackingList.value = []
  }

  function clearStateTracker () {
    trackingList.value = []
    trackerConnectionId = null
    trackerEventSource = null
    if (processingIntervalId !== null) {
      clearInterval(processingIntervalId)
      processingIntervalId = null
    }
    pendingNewItems.clear()
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

  function getTrackedItem (itemName: string): ItemState {
    return ensureItemTracking(itemName)
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
