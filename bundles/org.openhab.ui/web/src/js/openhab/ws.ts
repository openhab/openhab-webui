import { f7 } from 'framework7-vue'
import { getAccessToken } from './auth'

/**
 * A message that is sent over the openHAB WebSocket.
 * Interface for the structure of the message payload sent over the WebSocket.
 */
interface WebSocketMessage {
  type: string;
  topic: string;
  payload: string;
  source: string;
}

/**
 * A WebSocket that is extended with a keepalive/heartbeat mechanism.
 */
interface KeepaliveWebSocket extends WebSocket {
  id: string;
  keepaliveTimer?: number;
  setKeepalive: (seconds: number) => void;
  clearKeepalive: () => void;
}

/**
 * Build a heartbeat message for the given WebSocket client id.
 * @param {string} id WS client id
 * @return {string}
 */
function heartbeatMessage (id: string): string {
  const message: WebSocketMessage = {
    type: 'WebSocketEvent',
    topic: 'openhab/websocket/heartbeat',
    payload: 'PING',
    source: id
  }
  return JSON.stringify(message)
}

/**
 * Serializes an array of strings into a string representation for a JSON payload: `["a","b"]`.
 * @param {string[]} arr array of strings to serialize
 * @returns {string} serialized string
 */
function arrayToSerialisedString (arr: string[]): string {
  return '[' + arr.map((e) => '"' + e + '"').join(',') + ']'
}

/**
 * Build an event source filter message for the given WebSocket client id and the given sources.
 * Source filters can be used to remove events from a specific source from the event WS.
 * @param {string} id WS client id
 * @param {string[]} sources event sources to exclude
 * @return {string}
 */
function eventSourceFilterMessage (id: string, sources: string[]): string {
  const message: WebSocketMessage = {
    type: 'WebSocketEvent',
    topic: 'openhab/websocket/filter/source',
    payload: arrayToSerialisedString(sources),
    source: id
  }
  return JSON.stringify(message)
}

/**
 * Build an event type filter message for the given WebSocket client id and the given event types.
 * Event type filters can be used to select a subset of all available events for the event WS.
 * @param {string} id WS client id
 * @param {string[]} types event types to include
 * @return {string}
 */
function eventTypeFilterMessage (id: string, types: string[]): string {
  const message: WebSocketMessage = {
    type: 'WebSocketEvent',
    topic: 'openhab/websocket/filter/type',
    payload: arrayToSerialisedString(types),
    source: id
  }
  return JSON.stringify(message)
}

/**
 * Build an event topic filter message for the given WebSocket client id and the given event topics.
 * Event topic filters can be used to select a subset of all available events for the event WS.
 * @param {string} id WS client id
 * @param {string[]} topics event topics to include
 * @returns {string}
 */
function eventTopicFilterMesssage (id: string, topics: string[]): string {
  const message: WebSocketMessage = {
    type: 'WebSocketEvent',
    topic: 'openhab/websocket/filter/topic',
    payload: arrayToSerialisedString(topics),
    source: id
  }
  return JSON.stringify(message)
}

const openWSConnections: KeepaliveWebSocket[] = []

type MessageCallback = (data: WebSocketMessage) => void;
type ReadyCallback = (event: Event) => void;
type ErrorCallback = (event: Event) => void;
type HeartbeatCallback = () => void;
type CloseCallback = (event: CloseEvent) => void;

/**
 * Creates a new {@link KeepaliveWebSocket} connection.
 * @param path the path to connect to, e.g. `/ws`
 * @param messageCallback the callback to handle incoming messages
 * @param readyCallback the callback to handle the connection being ready
 * @param errorCallback the callback to handle errors
 * @param heartbeatCallback the callback to handle heartbeats
 * @param heartbeatInterval the interval in seconds for sending heartbeats
 */
function newWSConnection (
  path: string,
  messageCallback: MessageCallback,
  readyCallback: ReadyCallback | undefined,
  errorCallback: ErrorCallback | undefined,
  heartbeatCallback: HeartbeatCallback | undefined,
  heartbeatInterval: number
): KeepaliveWebSocket {
  const encodedToken = btoa(getAccessToken()).replace(/=*$/, '')

  // Create a new WebSocket connection and set the access token through the protocol field
  const socket = new WebSocket(path, [
    `org.openhab.ws.accessToken.base64.${encodedToken}`,
    'org.openhab.ws.protocol.default'
  ]) as KeepaliveWebSocket

  socket.id = 'ui-' + f7.utils.id()

  // Implement the setKeepalive method on the socket object
  socket.setKeepalive = (seconds: number) => {
    if (!heartbeatCallback) return
    console.debug('Setting keepalive interval seconds', seconds)
    socket.clearKeepalive()
    socket.keepaliveTimer = setInterval(() => {
      heartbeatCallback()
    }, seconds * 1000)
  }

  // Implement the clearKeepalive method on the socket object
  socket.clearKeepalive = () => {
    if (socket.keepaliveTimer) clearInterval(socket.keepaliveTimer)
    delete socket.keepaliveTimer
  }

  // Handle WebSocket connection opened
  socket.onopen = (event: Event) => {
    socket.setKeepalive(heartbeatInterval)
    if (readyCallback) readyCallback(event)
  }

  // Handle WebSocket message received
  socket.onmessage = (event: MessageEvent) => {
    let evt: any = event.data
    try {
      // The message is expected to be JSON, but we handle the case where it's not.
      evt = JSON.parse(event.data)
    } catch (e) {
      console.error('Error while parsing message', e)
      return
    }
    messageCallback(evt)
  }

  // Handle WebSocket error
  socket.onerror = (event: Event) => {
    console.error('WebSocket error', event)
    if (errorCallback) errorCallback(event)
  }

  // WebSocket closure is handled in the `close` function of the exported WebSocketService, not here.

  // Add the new WebSocket connection to the list
  openWSConnections.push(socket)
  console.debug(`new WS connection: ${socket.url}, ${openWSConnections.length} open connections`)
  console.debug(openWSConnections)

  return socket
}

const WebSocketService = {
  /**
   * Connect to the WebSocket at the given path.
   * This method provides raw access to WebSockets, the caller has to take care of the keepalive mechanism by specifying a heartbeat callback.
   *
   * @param path path to connect to, e.g. `/ws`
   * @param messageCallback message callback to handle incoming messages
   * @param heartbeatCallback heartbeat callback
   * @param readyCallback ready callback
   * @param errorCallback error callback
   * @param heartbeatInterval heartbeat interval in seconds (defaults to 5)
   */
  connect (
    path: string,
    messageCallback: MessageCallback,
    heartbeatCallback: HeartbeatCallback,
    readyCallback?: ReadyCallback,
    errorCallback?: ErrorCallback,
    heartbeatInterval: number = 5
  ): KeepaliveWebSocket {
    return newWSConnection(path, messageCallback, readyCallback, errorCallback, heartbeatCallback, heartbeatInterval)
  },
  /**
   * Connect to the event WebSocket, which provides direct access to the EventBus.
   * This convenience method takes care of the keepalive mechanism as well as filter setup.
   *
   * @param topics array of event topics to filter by, if empty all events are received
   * @param messageCallback message callback to handle incoming messages
   * @param readyCallback ready callback
   * @param errorCallback error callback
   */
  events (
    topics: string[],
    messageCallback: MessageCallback,
    readyCallback?: ReadyCallback,
    errorCallback?: ErrorCallback
  ): KeepaliveWebSocket {
    let socket: KeepaliveWebSocket

    /**
     * Extends the message callback by filtering out WebSocketEvent messages, which are only relevant for managing the WebSocket connection.
     * @param event
     */
    const extendedMessageCallback: MessageCallback = (event: WebSocketMessage) => {
      if (event.type === 'WebSocketEvent') return
      messageCallback(event)
    }

    /**
     * Extends the ready callback by sending the event source filter message and event topic filter message.
     * @param event
     */
    const extendedReadyCallback: ReadyCallback = (event: Event) => {
      socket.send(eventSourceFilterMessage(socket.id, [socket.id]))
      if (Array.isArray(topics) && topics.length > 0) socket.send(eventTopicFilterMesssage(socket.id, topics))
      if (readyCallback) readyCallback(event)
    }

    const heartbeatCallback: HeartbeatCallback = () => {
      socket.send(heartbeatMessage(socket.id))
    }

    socket = this.connect(
      '/ws/events',
      extendedMessageCallback,
      heartbeatCallback,
      extendedReadyCallback,
      errorCallback
    )

    return socket
  },
  /**
   * Close the given WebSocket connection.
   *
   * @param socket the WebSocket connection to close
   * @param callback callback to execute on connection close
   */
  close (
    socket: WebSocket,
    callback?: CloseCallback): void {
    if (!socket) return

    const keepaliveWebSocket = socket as KeepaliveWebSocket

    const index = openWSConnections.indexOf(keepaliveWebSocket)
    if (index >= 0) {
      openWSConnections.splice(index, 1)
    }

    console.debug(`WS connection closed: ${keepaliveWebSocket.url}, ${openWSConnections.length} open connections`)
    console.debug(openWSConnections)

    keepaliveWebSocket.onclose = (event: CloseEvent) => {
      if (callback) {
        callback(event)
      }
    }

    keepaliveWebSocket.clearKeepalive()
    keepaliveWebSocket.close()
  }
}

export default WebSocketService
