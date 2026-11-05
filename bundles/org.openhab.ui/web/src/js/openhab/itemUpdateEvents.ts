import sse from './sse'

interface ItemUpdateEvent {
  topic: string
  payload: string
  type?: string
}

type ItemUpdateCallback = (event: ItemUpdateEvent) => void

const subscribers = new Map<string, Set<ItemUpdateCallback>>()

let connection: ReturnType<typeof sse.connect> | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let activeTopics = ''
let connectionGeneration = 0

function handleEvent(event: ItemUpdateEvent) {
  const match = /^openhab\/items\/([^/]+)\/stateupdated$/.exec(event.topic)
  if (!match) return

  const itemName = match[1]
  const callbacks = subscribers.get(itemName)
  if (!callbacks) return

  console.debug('[ItemUpdateEvents] Received:', itemName, event.payload)

  for (const callback of callbacks) {
    try {
      callback(event)
    } catch (error) {
      console.error('[ItemUpdateEvents] Subscriber error:', error)
    }
  }
}

function updateConnection() {
  reconnectTimer = null

  const topics = Array.from(subscribers.keys())
    .sort()
    .map((item) => `openhab/items/${item}/stateupdated`)
    .join(',')

  if (topics === activeTopics && connection) return

  // Invalidate callbacks belonging to the previous connection.
  const generation = ++connectionGeneration

  if (connection) {
    sse.close(connection)
    connection = null
  }

  activeTopics = topics

  if (!topics) {
    console.debug('[ItemUpdateEvents] No subscriptions, connection closed')
    return
  }

  const path = `/rest/events?topics=${topics}`

  console.debug('[ItemUpdateEvents] Connecting:', path)

  connection = sse.connect(
    path,
    [],
    (event: ItemUpdateEvent) => {
      if (generation !== connectionGeneration) return
      handleEvent(event)
    },
    () => {
      if (generation !== connectionGeneration) return
      console.warn('[ItemUpdateEvents] SSE connection error')
    }
  )
}

function scheduleConnectionUpdate() {
  if (reconnectTimer !== null) clearTimeout(reconnectTimer)

  reconnectTimer = setTimeout(updateConnection, 100)
}

export function subscribeItemUpdates(itemName: string, callback: ItemUpdateCallback): () => void {
  if (!itemName) return () => {}

  let callbacks = subscribers.get(itemName)

  if (!callbacks) {
    callbacks = new Set()
    subscribers.set(itemName, callbacks)
  }

  callbacks.add(callback)

  console.debug('[ItemUpdateEvents] Subscribe:', itemName)

  scheduleConnectionUpdate()

  return () => {
    const current = subscribers.get(itemName)
    if (!current) return

    current.delete(callback)

    if (current.size === 0) {
      subscribers.delete(itemName)
    }

    console.debug('[ItemUpdateEvents] Unsubscribe:', itemName)

    scheduleConnectionUpdate()
  }
}
