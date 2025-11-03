import { EventSourcePolyfill, NativeEventSource } from 'event-source-polyfill'
import { getAccessToken, getTokenInCustomHeader, getBasicCredentials, getRequireToken } from './auth'

/**
 * An EventSource that is extended with a keepalive/heartbeat mechanism.
 */
interface KeepaliveEventSource extends EventSource {
  keepaliveTimer?: number;
  setKeepalive: (seconds?: number) => void;
  clearKeepalive: () => void;
}

let openSSEClients: KeepaliveEventSource[] = []

type ReadyCallback = (data: string) => void;
type MessageCallback = (data: any) => void;
type ErrorCallback = () => void;
type HeartbeatCallback = (isAlive: boolean) => void;

/**
 * Creates and initializes a new Server-Sent Events (SSE) connection.
 */
function newSSEConnection (
  path: string,
  readyCallback: ReadyCallback | undefined,
  messageCallback: MessageCallback,
  errorCallback: ErrorCallback,
  heartbeatCallback: HeartbeatCallback | undefined
): KeepaliveEventSource {
  let eventSource: KeepaliveEventSource
  let reconnectSeconds = 1
  const headers: Record<string, string> = {}

  // Setup headers for authentication
  const accessToken = getAccessToken()
  if (accessToken && getRequireToken()) {
    if (getTokenInCustomHeader()) {
      headers['X-OPENHAB-TOKEN'] = accessToken
    } else {
      headers['Authorization'] = 'Bearer ' + accessToken
    }
  }
  const basicCreds = getBasicCredentials()
  if (basicCreds) {
    headers['Authorization'] = 'Basic ' + btoa(basicCreds.id + ':' + basicCreds.password)
  }

  // Core initialization logic
  function initEventSource (): KeepaliveEventSource {
    let newEventSource: EventSource

    if (Object.keys(headers).length > 0) {
      // Use EventSourcePolyfill when headers are needed
      newEventSource = new EventSourcePolyfill(path, { headers })
    } else {
      // Use NativeEventSource when no custom headers are needed
      newEventSource = new NativeEventSource(path)
    }

    // Type assertion to treat the EventSource as our extended interface,
    // allowing us to add custom methods/properties.
    const es = newEventSource as KeepaliveEventSource

    // Add keepalive/heartbeat mechanism
    es.setKeepalive = (seconds: number = 10) => {
      console.debug('Setting keepalive interval seconds', seconds)
      es.clearKeepalive()
      es.keepaliveTimer = setTimeout(() => {
        console.warn('SSE timeout error')
        if (heartbeatCallback) {
          heartbeatCallback(false)
        }
      }, (seconds + 2) * 1000)
    }

    es.clearKeepalive = () => {
      if (es.keepaliveTimer) clearTimeout(es.keepaliveTimer)
      delete es.keepaliveTimer
    }

    // Event handlers
    if (readyCallback) {
      es.addEventListener('ready', (e: MessageEvent) => {
        readyCallback(e.data)
      })
    }

    es.addEventListener('alive', (e: MessageEvent) => {
      // Type 'e.data' is string, parse to get the object with 'interval'
      let evt: { interval: number }
      try {
        evt = JSON.parse(e.data)
        es.setKeepalive(evt.interval)
      } catch (error) {
        console.error('Failed to parse "alive" message data:', error)
        if (heartbeatCallback) heartbeatCallback(false)
        return
      }

      if (heartbeatCallback) heartbeatCallback(true)
    })

    es.onmessage = (event: MessageEvent) => {
      let evt: any
      try {
        evt = JSON.parse(event.data)
      } catch (error) {
        console.error('Failed to parse SSE message data:', error)
        return
      }
      messageCallback(evt)
    }

    es.onopen = (event: Event) => {
      reconnectSeconds = 1 // Reset reconnection delay on successful open
    }

    es.onerror = (event: Event) => {
      console.warn('SSE error')
      es.clearKeepalive()
      if (errorCallback) {
        errorCallback()
      }

      // Handle reconnection logic
      // Note: readyState === 2 is defined as CLOSED in EventSource spec
      if (es.readyState === 2) {
        console.log('%c=!= Event source connection broken...', 'background-color: red; color: white')
        console.debug(`Attempting SSE reconnection in ${reconnectSeconds} seconds...`)

        setTimeout(() => {
          // Check state again before reconnecting
          if (es.readyState === 2) {
            reconnectSeconds = reconnectSeconds * 2
            if (reconnectSeconds > 10) reconnectSeconds = 10
            // Close the current broken connection
            es.close()
            es.clearKeepalive()
            // Reinitialize the connection
            eventSource = initEventSource() // Reassign the outer scope's eventSource
          }
        }, reconnectSeconds * 1000)
      }
    }

    return es
  }

  eventSource = initEventSource()

  openSSEClients.push(eventSource)
  console.debug(`new SSE connection: ${eventSource.url}, ${openSSEClients.length} open`)
  console.debug(openSSEClients)
  return eventSource
}

const SSEService = {
  /**
   * Connect to a generic SSE endpoint.
   * @param path path to connect to, e.g. `/rest/events`
   * @param topics array of event topics)
   * @param messageCallback callback to handle incoming messages
   * @param errorCallback error callback
   * @param heartbeatCallback heartbeat callback
   */
  connect (
    path: string,
    topics: string[],
    messageCallback: MessageCallback,
    errorCallback: ErrorCallback,
    heartbeatCallback?: HeartbeatCallback
  ): KeepaliveEventSource {
    return newSSEConnection(path, undefined, messageCallback, errorCallback, heartbeatCallback)
  },

  /**
   * Connect to the state tracking SSE endpoint (e.g., for item states).
   * @param path path to connect to
   * @param readyCallback ready callback
   * @param updateCallback callback to handle state updates (messages)
   * @param errorCallback error callback
   * @param [heartbeatCallback] heartbeat callback
   */
  connectStateTracker (
    path: string,
    readyCallback: ReadyCallback,
    updateCallback: MessageCallback,
    errorCallback: ErrorCallback,
    heartbeatCallback?: HeartbeatCallback
  ): KeepaliveEventSource {
    return newSSEConnection(path, readyCallback, updateCallback, errorCallback, heartbeatCallback)
  },

  /**
   * Close the given SSE connection.
   * @param es the SSE connection to close
   */
  close (es: EventSource): void {
    if (!es) return

    const keepaliveEventSource = es as KeepaliveEventSource

    const index = openSSEClients.indexOf(keepaliveEventSource)
    if (index >= 0) {
      openSSEClients.splice(index, 1)
    }

    console.debug(`SSE connection closed: ${keepaliveEventSource.url}, ${openSSEClients.length} open`)
    console.debug(openSSEClients)

    keepaliveEventSource.clearKeepalive()
    keepaliveEventSource.close()
  }
}

export default SSEService
