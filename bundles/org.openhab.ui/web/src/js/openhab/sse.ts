import { EventSourcePolyfill, NativeEventSource } from 'event-source-polyfill'
import { getAccessToken, getTokenInCustomHeader, getBasicCredentials } from './auth'
import type { ItemState } from '../stores/useStatesStore'

/**
 * A logical Server-Sent Events (SSE) connection handle that tracks the underlying EventSource instance and reconnection/keepalive states.
 */
export interface SSEConnection {
  /**
   * The fully resolved absolute URL of the connection endpoint.
   */
  readonly url: string
  /**
   * The current underlying EventSource instance used by this logical connection.
   * Updated automatically when a reconnection occurs.
   */
  currentEventSource: EventSource | null
  /**
   * A flag indicating whether this connection has been explicitly closed.
   * If true, it prevents further reconnection attempts and ignores any pending timer callbacks or stream events.
   */
  closed: boolean
  /**
   * The timeout job ID for the schedules reconnection attempt.
   * Used to cancel pending reconnects when the connection is explicitly closed.
   * Only present if the underlying EventSource connection has been lost.
   */
  reconnectTimeout: number | null
  /**
   * The timeout job ID for the active keepalive/heartbeat timer.
   * Used to track if the server stops sending heartbeat signals.
   * Only present if the server sent a {@code alive} heartbeat message.
   */
  keepaliveTimer: number | null
  /**
   * Establishes or resets the keepalive/heartbeat timer.
   * Starts a timer for <code>seconds + 2</code> seconds, triggering the heartbeat callback with `false` if no heartbeat is received before the timer expires.
   *
   * @param seconds the heartbeat interval in seconds
   */
  setKeepalive: (seconds?: number) => void
  /**
   * Clears the active keepalive/heartbeat timer and clear the timeout job ID.
   */
  clearKeepalive: () => void
}

let openSSEClients: SSEConnection[] = []

type ReadyCallback = (data: string) => void
type MessageCallback = (data: any) => void
type StateMessageCallback = (data: Record<string, ItemState>) => void
type ErrorCallback = () => void
type HeartbeatCallback = (isAlive: boolean) => void

/**
 * Creates and initializes a new Server-Sent Events (SSE) connection.
 */
function newSSEConnection(
  path: string,
  readyCallback: ReadyCallback | undefined,
  messageCallback: MessageCallback,
  errorCallback: ErrorCallback,
  heartbeatCallback: HeartbeatCallback | undefined
): SSEConnection {
  let reconnectSeconds = 1

  const connection: SSEConnection = {
    url: '',
    currentEventSource: null,
    closed: false,
    reconnectTimeout: null,
    keepaliveTimer: null,
    setKeepalive(seconds: number = 10) {
      console.debug('Setting keepalive interval seconds', seconds)
      this.clearKeepalive()
      this.keepaliveTimer = setTimeout(
        () => {
          console.warn('SSE timeout error')
          if (heartbeatCallback) {
            heartbeatCallback(false)
          }
        },
        (seconds + 2) * 1000
      )
    },
    clearKeepalive() {
      if (this.keepaliveTimer) {
        clearTimeout(this.keepaliveTimer)
      }
      this.keepaliveTimer = null
    }
  }

  // Core initialization logic
  function initEventSource(): EventSource {
    const headers: Record<string, string> = {}
    // Setup headers for authentication.
    // We make sure to always use the latest token here, otherwise it may
    // have already expired when initEventSource() is called again after
    // a connection failure.
    const accessToken = getAccessToken()
    if (accessToken) {
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

    let newEventSource: EventSource

    if (Object.keys(headers).length > 0) {
      // Use EventSourcePolyfill when headers are needed
      newEventSource = new EventSourcePolyfill(path, { headers })
    } else {
      // Use NativeEventSource when no custom headers are needed
      newEventSource = new NativeEventSource(path)
    }

    // Event handlers
    if (readyCallback) {
      newEventSource.addEventListener('ready', (e: MessageEvent) => {
        if (connection.closed) return
        readyCallback(e.data as string)
      })
    }

    newEventSource.addEventListener('alive', (e: MessageEvent) => {
      if (connection.closed) return
      // Type 'e.data' is string, parse to get the object with 'interval'
      let evt: { interval: number }
      try {
        evt = JSON.parse(e.data as string) as { interval: number }
        connection.setKeepalive(evt.interval)
      } catch (error) {
        console.error('Failed to parse "alive" message data:', error)
        if (heartbeatCallback) heartbeatCallback(false)
        return
      }

      if (heartbeatCallback) heartbeatCallback(true)
    })

    newEventSource.onmessage = (event: MessageEvent) => {
      if (connection.closed) return
      let evt: unknown
      try {
        evt = JSON.parse(event.data as string)
      } catch (error) {
        console.error('Failed to parse SSE message data:', error)
        return
      }
      messageCallback(evt)
    }

    newEventSource.onopen = (event: Event) => {
      if (connection.closed) return
      reconnectSeconds = 1 // Reset reconnection delay on successful open
    }

    newEventSource.onerror = (event: Event) => {
      if (connection.closed) return
      console.warn('SSE error')
      connection.clearKeepalive()
      if (errorCallback) {
        errorCallback()
      }

      const scheduleReconnect = () => {
        console.debug(`Attempting SSE reconnection in ${reconnectSeconds} seconds...`)

        connection.reconnectTimeout = setTimeout(() => {
          if (connection.closed) return
          // Check state again before reconnecting
          if (newEventSource.readyState === 2) {
            reconnectSeconds = reconnectSeconds * 2
            if (reconnectSeconds > 10) reconnectSeconds = 10
            // Close the current broken connection
            newEventSource.close()
            connection.clearKeepalive()
            // Reinitialize the connection
            connection.reconnectTimeout = null
            connection.currentEventSource = initEventSource()
          }
        }, reconnectSeconds * 1000)
      }

      // Handle reconnection logic
      // Note: readyState === 2 is defined as CLOSED in EventSource spec
      if (newEventSource.readyState === 2) {
        console.log('%c=!= Event source connection broken...', 'background-color: red; color: white')

        // Since SSE hides the response status, do a regular fetch to figure out if our credentials are rejected or not
        fetch(path, { method: 'HEAD', headers: headers })
          .then((response) => {
            if (connection.closed) return
            if (response.status === 401) {
              console.debug(`SSE: The server responded with "${response.status}", aborting reconnect.`)
              newEventSource.close()
              connection.clearKeepalive()
            } else {
              scheduleReconnect()
            }
          })
          .catch((err) => {
            if (connection.closed) return
            console.debug(`SSE: Couldn't connect to the server, scheduling reconnect: ${err}`)
            scheduleReconnect()
          })
      }
    }

    return newEventSource
  }

  const es = initEventSource()
  connection.currentEventSource = es
  interface MutableSSEConnection extends SSEConnection {
    url: string
  }
  ;(connection as MutableSSEConnection).url = es.url

  openSSEClients.push(connection)
  console.debug(`new SSE connection: ${connection.url}, ${openSSEClients.length} open`)
  console.debug(openSSEClients)
  return connection
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
  connect(
    path: string,
    topics: string[],
    messageCallback: MessageCallback,
    errorCallback: ErrorCallback,
    heartbeatCallback?: HeartbeatCallback
  ): SSEConnection {
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
  connectStateTracker(
    path: string,
    readyCallback: ReadyCallback,
    updateCallback: StateMessageCallback,
    errorCallback: ErrorCallback,
    heartbeatCallback?: HeartbeatCallback
  ): SSEConnection {
    return newSSEConnection(path, readyCallback, updateCallback, errorCallback, heartbeatCallback)
  },

  /**
   * Close the given SSE connection.
   * @param conn the SSE connection to close
   */
  close(conn: SSEConnection): void {
    if (!conn) return

    const index = openSSEClients.indexOf(conn)
    if (index >= 0) {
      openSSEClients.splice(index, 1)
    }

    console.debug(`SSE connection closed: ${conn.url}, ${openSSEClients.length} open`)
    console.debug(openSSEClients)

    conn.closed = true
    conn.clearKeepalive()
    if (conn.reconnectTimeout) {
      clearTimeout(conn.reconnectTimeout)
      conn.reconnectTimeout = null
    }
    if (conn.currentEventSource) {
      conn.currentEventSource.close()
      conn.currentEventSource = null
    }
  }
}

export default SSEService
