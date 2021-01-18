import { EventSourcePolyfill, NativeEventSource } from 'event-source-polyfill'
import { getAccessToken, getTokenInCustomHeader, getBasicCredentials, getRequireToken } from './auth'

let openSSEClients = []

function newSSEConnection (path, readyCallback, messageCallback, errorCallback) {
  let eventSource
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
  if (Object.keys(headers).length > 0) {
    eventSource = new EventSourcePolyfill(path, { headers })
  } else {
    eventSource = new NativeEventSource(path)
  }

  eventSource.addEventListener('ready', (e) => {
    readyCallback(e.data)
  })

  eventSource.onmessage = (event) => {
    let evt = JSON.parse(event.data)
    messageCallback(evt)
  }

  eventSource.onopen = (event) => {
  }

  eventSource.onerror = () => {
    console.warn('SSE error')
    if (errorCallback) {
      errorCallback()
    }
    if (eventSource.readyState === 2) {
      console.log('%c=!= Event source connection broken...', 'background-color: red; color: white')
    }
  }

  openSSEClients.push(eventSource)
  console.debug(`new SSE connection: ${eventSource.url}, ${openSSEClients.length} open`)
  console.debug(openSSEClients)
  return eventSource
}

export default {
  connect (path, topics, messageCallback, errorCallback) {
    return newSSEConnection(path, null, messageCallback, errorCallback)
  },
  connectStateTracker (path, readyCallback, updateCallback, errorCallback) {
    return newSSEConnection(path, readyCallback, updateCallback, errorCallback)
  },
  close (client, callback) {
    if (!client) return
    if (openSSEClients.indexOf(client) >= 0) {
      openSSEClients.splice(openSSEClients.indexOf(client), 1)
    }
    console.debug(`SSE connection closed: ${client.url}, ${openSSEClients.length} open`)
    console.debug(openSSEClients)

    client.close()
  }
}
