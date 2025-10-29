import { f7 } from 'framework7-vue'
import { getAccessToken } from './auth'

/**
 * Build a heartbeat message for the given WebSocket client id.
 * @param {string} id WS client id
 * @return {string}
 */
function heartbeatMessage (id) {
  return JSON.stringify({
    type: 'WebSocketEvent',
    topic: 'openhab/websocket/heartbeat',
    payload: 'PING',
    source: id
  })
}

function arrayToSerialisedString (arr) {
  return '[' + arr.map((e) => '"' + e + '"').join(',') + ']'
}

/**
 * Build a event source filter message for the given WebSocket client id and the given sources.
 * Source filters can be used to remove events from a specific source from the event WS.
 * @param {string} id WS client id
 * @param {string[]} sources event sources to exclude
 * @return {string}
 */
function eventSourceFilterMessage (id, sources) {
  return JSON.stringify({
    type: 'WebSocketEvent',
    topic: 'openhab/websocket/filter/source',
    payload: arrayToSerialisedString(sources),
    source: id
  })
}

/**
 * Build an event type filter message for the given WebSocket client id and the given event types.
 * Event type filters can be used to select a sub-set of all available events for the event WS.
 * @param {string} id WS client id
 * @param {string[]} types event types to include
 * @return {string}
 */
function eventTypeFilterMessage (id, types) {
  return JSON.stringify({
    type: 'WebSocketEvent',
    topic: 'openhab/websocket/filter/type',
    payload: arrayToSerialisedString(types),
    source: id
  })
}

/**
 * Build an event topic filter message for the given WebSocket client id and the given event topics.
 * Event topic filters can be used to select a sub-set of all available events for the event WS.
 * @param {string} id WS client id
 * @param {string[]} topics event topics to include
 * @returns {string}
 */
function eventTopicFilterMesssage (id, topics) {
  return JSON.stringify({
    type: 'WebSocketEvent',
    topic: 'openhab/websocket/filter/topic',
    payload: arrayToSerialisedString(topics),
    source: id
  })
}

const openWSConnections = []

function newWSConnection (path, messageCallback, readyCallback, errorCallback, heartbeatCallback, heartbeatInterval) {
  const encodedToken = btoa(getAccessToken()).replace(/=*$/, '')
  // Create a new WebSocket connection
  const socket = new WebSocket(path, [`org.openhab.ws.accessToken.base64.${encodedToken}`, 'org.openhab.ws.protocol.default'])

  socket.id = 'ui-' + f7.utils.id()

  // Handle WebSocket connection opened
  socket.onopen = (event) => {
    socket.setKeepalive(heartbeatInterval)
    if (readyCallback) readyCallback(event)
  }

  // Handle WebSocket message received
  socket.onmessage = (event) => {
    let evt = event.data
    try {
      evt = JSON.parse(event.data)
    } catch (e) {
      console.error('Error while parsing message', e)
    }
    messageCallback(evt)
  }

  // Handle WebSocket error
  socket.onerror = (event) => {
    console.error('WebSocket error', event)
    if (errorCallback) {
      errorCallback(event)
    }
  }

  // WebSocket keep alive
  socket.setKeepalive = (seconds) => {
    if (!heartbeatCallback) return
    console.debug('Setting keepalive interval seconds', seconds)
    socket.clearKeepalive()
    socket.keepaliveTimer = setInterval(() => {
      heartbeatCallback()
    }, seconds * 1000)
  }

  socket.clearKeepalive = () => {
    if (socket.keepaliveTimer) clearInterval(socket.keepaliveTimer)
    delete socket.keepaliveTimer
  }

  // Add the new WebSocket connection to the list
  openWSConnections.push(socket)
  console.debug(`new WS connection: ${socket.url}, ${openWSConnections.length} open connections`)
  console.debug(openWSConnections)

  return socket
}

export default {
  /**
   * Connect to the WebSocket at the given path.
   * This method provides raw access to WebSockets, the caller has to take care of the keepalive mechanism by specifying a heartbeat callback.
   *
   * @param {string} path path to connect to, e.g. `/ws`
   * @param {fn} messageCallback message callback to handle incoming messages
   * @param {fn} heartbeatCallback heartbeat callback
   * @param {fn} [readyCallback] ready callback
   * @param {fn} [errorCallback] error callback
   * @param {number} [heartbeatInterval=5] heartbeat interval in seconds
   * @return {WebSocket}
   */
  connect (path, messageCallback, heartbeatCallback, readyCallback, errorCallback, heartbeatInterval = 5) {
    return newWSConnection(path, messageCallback, readyCallback, errorCallback, heartbeatCallback, heartbeatInterval)
  },
  /**
   * Connect to the event WebSocket, which provides direct access to the EventBus.
   * This convenience method takes care of the keepalive mechanism as well as filter setup.
   *
   * @param {string[]} topics array of event topics to filter by, if empty all events are received
   * @param {fn} messageCallback message callback to handle incoming messages
   * @param {fn} [readyCallback] ready callback
   * @param {fn} [errorCallback] error callback
   * @return {WebSocket}
   */
  events (topics, messageCallback, readyCallback, errorCallback) {
    let socket

    const extendedMessageCallback = (event) => {
      if (event.type === 'WebSocketEvent') return
      messageCallback(event)
    }

    const extendedReadyCallback = (event) => {
      socket.send(eventSourceFilterMessage(socket.id, [socket.id]))
      if (Array.isArray(topics) && topics.length > 0) socket.send(eventTopicFilterMesssage(socket.id, topics))
      if (readyCallback) readyCallback(event)
    }

    const heartbeatCallback = () => {
      socket.send(heartbeatMessage(socket.id))
    }

    socket = this.connect('/ws/events', extendedMessageCallback, heartbeatCallback, extendedReadyCallback, errorCallback)
    return socket
  },
  /**
   * Close the given WebSocket connection.
   *
   * @param {WebSocket} socket
   * @param {fn} [callback=null] callback to execute on connection close
   */
  close (socket, callback = null) {
    if (!socket) return
    if (openWSConnections.indexOf(socket) >= 0) {
      openWSConnections.splice(openWSConnections.indexOf(socket), 1)
    }
    console.debug(`WS connection closed: ${socket.url}, ${openWSConnections.length} open connections`)
    console.debug(openWSConnections)
    socket.onclose = (event) => {
      if (callback) {
        callback(event)
      }
    }
    socket.clearKeepalive()
    socket.close()
  }
}
