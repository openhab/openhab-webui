/*
export const someAction = (state) => {}
 */
import axios from 'axios'
import 'event-source-polyfill'

import { Notify } from 'quasar'

let eventSource
let authorizationHeader

export const initialLoad = (context) => {
  // if (context.state.items.length) return Promise.resolve()
  if (eventSource && eventSource.readyState < 2) {
    eventSource.close()
  }
  console.log('Fetching initial state of all items...')

  return new Promise((resolve, reject) => {
    axios.get('/rest/items?metadata=habot').then((resp) => {
      context.commit('updateAll', resp.data)
      context.commit('setReady')
      resolve()
    }).catch(err => {
      reject(err)
    })
  })
}

export const watchEvents = async (context, credential) => {
  if (credential || authorizationHeader) {
    if (!authorizationHeader) {
      authorizationHeader = 'Basic ' + btoa(credential.id + ':' + credential.password)
    }
    eventSource = new EventSourcePolyfill('/rest/events', // eslint-disable-line no-undef
      { headers: { 'Authorization': authorizationHeader } })
  } else {
    eventSource = new EventSource('/rest/events')
  }

  eventSource.onopen = (event) => {
    context.state.connectionBroken = false
  }

  eventSource.onmessage = (event) => {
    let evt = JSON.parse(event.data)

    if (evt.type.indexOf('ItemStateChangedEvent') >= 0) {
      let payload = JSON.parse(evt.payload)
      let itemName = evt.topic.split('/')[2]
      let item = context.getters.name(itemName)
      if (item.transformedState) {
        // need to get the transformedState from the API
        axios.get('/rest/items/' + itemName).then((resp) => {
          context.commit('updateOne', { itemName: itemName, newState: payload.value, newTransformedState: resp.data.transformedState })
        })
      } else {
        context.commit('updateOne', { itemName: itemName, newState: payload.value })
      }
    }

    if (evt.type.indexOf('ItemAddedEvent') >= 0 || evt.type.indexOf('ItemUpdatedEvent') >= 0 || evt.type.indexOf('ItemRemovedEvent') >= 0) {
      console.log('Items have changed, refreshing store')
      eventSource.close() // close the event source immediately to avoid catching more events
      Notify.create({ type: 'info', message: 'Items have changed, refreshing' })
      setTimeout(() => {
        context.dispatch('initialLoad').then(() => {
          context.dispatch('watchEvents')
        })
      }, 500)
    }
  }

  eventSource.onerror = () => {
    if (eventSource.readyState === 2) {
      context.state.connectionBroken = true
      eventSource.close()
      console.log('%c=!= Event source connection broken...', 'background-color: red; color: white')
    }
  }
}

export const sendCmd = (context, payload) => {
  if (payload.updateState) {
    let currentState = context.getters.itemState(payload.itemName, true)
    if (currentState && currentState === payload.command) return
    context.commit('updateOne', { itemName: payload.itemName, newState: payload.command.toString() })
  }
  console.log('%cSending command to ' + payload.itemName + ': ' + payload.command, 'font-weight: bold')
  axios.post('/rest/items/' + payload.itemName, payload.command, {
    headers: { 'Content-Type': 'text/plain', 'X-OpenHAB-Source': 'org.openhab.ui.habot' }
  })
}
