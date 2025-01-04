import { getAccessToken } from './auth'

const HEARTBEAT_MESSAGE = `{
  "type": "WebSocketEvent",
  "topic": "openhab/websocket/heartbeat",
  "payload": "PING",
  "source": "WebSocketTestInstance"
}`

const openWSConnections = []

function newWSConnection (path, messageCallback, readyCallback, errorCallback, heartbeatCallback, heartbeatInterval) {
  const encodedToken = btoa(getAccessToken()).replace(/=*$/, '')
  // Create a new WebSocket connection
  const socket = new WebSocket(path, [`org.openhab.ws.accessToken.base64.${encodedToken}`, 'org.openhab.ws.protocol.default'])

  // Handle WebSocket connection opened
  socket.onopen = (event) => {
    socket.setKeepalive(heartbeatInterval)
    if (readyCallback) {
      readyCallback(event)
    }
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
  socket.setKeepalive = (seconds = 5) => {
    console.debug('Setting keepalive interval seconds', seconds)
    socket.clearKeepalive()
    socket.keepaliveTimer = setInterval(() => {
      if (heartbeatCallback) {
        heartbeatCallback()
      } else {
        socket.send(HEARTBEAT_MESSAGE)
      }
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
   * Connect to the websocket at the given path.
   *
   * @param {string} path path to connect to, e.g. `/ws`
   * @param {fn} messageCallback
   * @param {fn} [readyCallback=null]
   * @param {fn} [errorCallback=null]
   * @param {fn} [heartbeatCallback=null] heartbeat callback to use instead of the default PING/PONG
   * @param {number} [heartbeatInterval=5] heartbeat interval in seconds
   * @return {WebSocket}
   */
  connect (path, messageCallback, readyCallback = null, errorCallback = null, heartbeatCallback = null, heartbeatInterval = 5) {
    return newWSConnection(path, messageCallback, readyCallback, errorCallback, heartbeatCallback, heartbeatInterval)
  },
  /**
   * Close the given websocket connection.
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
    socket.close()
    socket.clearKeepalive()
  }
}
