import { EventSourcePolyfill, NativeEventSource } from 'event-source-polyfill'
import { getAccessToken, getTokenInCustomHeader, getBasicCredentials, getRequireToken } from './auth'

let openSSEClients = []

function newSSEConnection (path, readyCallback, messageCallback, errorCallback, heartbeatCallback) {
  let eventSource
  let reconnectSeconds = 1
  const headers = {}
  if (getAccessToken() && getRequireToken()) {
    if (getTokenInCustomHeader()) {
      headers['X-OPENHAB-TOKEN'] = getAccessToken()
    } else {
      headers['Authorization'] = 'Bearer ' + getAccessToken()
    }
  }
  if (getBasicCredentials()) {
    const creds = getBasicCredentials()
    headers['Authorization'] = 'Basic ' + btoa(creds.id + ':' + creds.password)
  }

  function initEventSource () {
    if (Object.keys(headers).length > 0) {
      eventSource = new EventSourcePolyfill(path, { headers })
    } else {
      eventSource = new NativeEventSource(path)
    }

    eventSource.addEventListener('ready', (e) => {
      readyCallback(e.data)
    })

    eventSource.addEventListener('alive', (e) => {
      let evt = JSON.parse(e.data)
      eventSource.setKeepalive(evt.interval)
      if (heartbeatCallback) {
        heartbeatCallback(true)
      }
    })

    eventSource.onmessage = (event) => {
      let evt = JSON.parse(event.data)
      messageCallback(evt)
    }

    eventSource.onopen = (event) => {
      reconnectSeconds = 1
    }

    eventSource.onerror = () => {
      console.warn('SSE error')
      eventSource.clearKeepalive()
      if (errorCallback) {
        errorCallback()
      }
      if (eventSource.readyState === 2) {
        console.log('%c=!= Event source connection broken...', 'background-color: red; color: white')
        console.debug(`Attempting SSE reconnection in ${reconnectSeconds} seconds...`)
        setTimeout(() => {
          if (eventSource.readyState === 2) {
            reconnectSeconds = reconnectSeconds * 2
            if (reconnectSeconds > 10) reconnectSeconds = 10
            eventSource.close()
            eventSource.clearKeepalive()
            eventSource = initEventSource()
          }
        }, reconnectSeconds * 1000)
      }
    }

    eventSource.setKeepalive = (seconds = 10) => {
      console.debug('Setting keepalive interval seconds', seconds)
      eventSource.clearKeepalive()
      eventSource.keepaliveTimer = setTimeout(() => {
        console.warn('SSE timeout error')
      }, (seconds + 2) * 1000)
    }

    eventSource.clearKeepalive = () => {
      if (eventSource.keepaliveTimer) clearTimeout(eventSource.keepaliveTimer)
      delete eventSource.keepaliveTimer
    }

    return eventSource
  }

  eventSource = initEventSource()

  openSSEClients.push(eventSource)
  console.debug(`new SSE connection: ${eventSource.url}, ${openSSEClients.length} open`)
  console.debug(openSSEClients)
  return eventSource
}

export default {
  connect (path, topics, messageCallback, errorCallback, heartbeatCallback) {
    return newSSEConnection(path, null, messageCallback, errorCallback, heartbeatCallback)
  },
  connectStateTracker (path, readyCallback, updateCallback, errorCallback, heartbeatCallback) {
    return newSSEConnection(path, readyCallback, updateCallback, errorCallback, heartbeatCallback)
  },
  close (client, callback) {
    if (!client) return
    if (openSSEClients.indexOf(client) >= 0) {
      openSSEClients.splice(openSSEClients.indexOf(client), 1)
    }
    console.debug(`SSE connection closed: ${client.url}, ${openSSEClients.length} open`)
    console.debug(openSSEClients)
    client.close()
    client.clearKeepalive()
  }
}
