import Vue from 'vue'

const state = {
  trackingList: [],
  itemStates: {},
  trackerConnectionId: null,
  trackerEventSource: null,
  pendingTrackingListUpdate: false
}

let stateTrackingProxy = null

const handler = (context) => {
  return {
    get (obj, prop) {
      if (prop === '_keys') return Object.keys(context.state.itemStates)

      // to avoid the Vue devtools requesting invalid items in development
      if (['state', 'getters', '_vm', 'toJSON'].indexOf(prop.toString()) >= 0) return {}
      if (typeof prop !== 'string') return {}

      const itemName = prop
      if (!context.getters.isItemTracked(itemName)) {
        console.log(`Proxy: need ${itemName.toString()}`)
        context.commit('addToTrackingList', itemName.toString())

        // Return the previous state anyway even if it might be outdated (it will be refreshed quickly after)
        if (!context.state.itemStates[itemName]) {
          context.commit('setItemState', { itemName: itemName, itemState: { state: '-' } })
        }

        context.dispatch('updateTrackingList')
      }
      return context.state.itemStates[itemName]
    },
    set (obj, prop, value) {
      console.log(`Proxy: setting ${prop.toString()} to ${value}`)
      context.commit('setItemState', { itemName: prop.toString(), itemState: value })
      return true
    }
  }
}

const getters = {
  trackedItems: (state) => {
    return stateTrackingProxy || {}
  },
  isItemTracked: (state) => (itemName) => {
    return state.trackingList.indexOf(itemName) >= 0
  }
}

const actions = {
  initializeTrackingStore (context) {
    if (stateTrackingProxy) return
    console.log('Initializing state tracking store proxy')
    stateTrackingProxy = new Proxy({}, handler(context))
  },
  startTrackingStates (context) {
    console.log('Start tracking states, clearing tracking list')
    context.commit('clearTrackingList')
    const eventSource = this._vm.$oh.sse.connectStateTracker('/rest/events/states',
      (connectionId) => {
        context.commit('setTrackerConnectionId', connectionId)
        const trackingListJson = JSON.stringify(context.state.trackingList)
        console.log('Setting initial tracking list: ' + trackingListJson)
        this._vm.$oh.api.postPlain('/rest/events/states/' + connectionId, JSON.stringify(context.state.trackingList), 'text/plain', 'application/json')
      },
      (updates) => {
        for (const item in updates) {
          context.commit('setItemState', { itemName: item, itemState: updates[item] })
        }
      })
    context.commit('setTrackingEventSource', eventSource)
  },
  stopTrackingStates (context) {
    console.log('Stop tracking states')
    console.log('Start tracking states, clearing tracking list')
    context.commit('clearTrackingList')
    this._vm.$oh.sse.close(context.state.trackerEventSource)
  },
  updateTrackingList (context, payload) {
    // context.commit('setTrackingList', payload)
    if (!context.state.trackerConnectionId) {
      console.log('updateTrackingList: No connection id, not calling the API')
      return
    }
    if (context.state.pendingTrackingListUpdate) {
      console.log('updateTrackingList: Pending tracking list update, not calling the API')
      return
    }
    context.commit('setPendingTrackingListUpdate', true)
    Vue.nextTick(() => {
      context.commit('setPendingTrackingListUpdate', false)
      const trackingListJson = JSON.stringify(context.state.trackingList)
      console.log('Updating tracking list: ' + trackingListJson)
      this._vm.$oh.api.postPlain('/rest/events/states/' + context.state.trackerConnectionId, trackingListJson, 'text/plain', 'application/json')
    })
  },
  sendCommand (context, { itemName, cmd }) {
    console.log(`Sending command to ${itemName}: ${cmd}`)
    this._vm.$oh.api.postPlain('/rest/items/' + itemName, cmd, 'text/plain', 'text/plain')
  }
}

const mutations = {
  addToTrackingList (state, itemName) {
    state.trackingList.push(itemName)
  },
  setTrackingEventSource (state, payload) {
    state.trackerEventSource = payload
  },
  setTrackerConnectionId (state, payload) {
    state.trackerConnectionId = payload
  },
  setTrackingList (state, payload) {
    state.trackingList = payload
  },
  clearTrackingList (state, payload) {
    Vue.set(state, 'trackingList', [])
  },
  setItemState (state, { itemName, itemState }) {
    Vue.set(state.itemStates, itemName.toString(), itemState)
    // state.itemStates[itemName] = itemState
  },
  setPendingTrackingListUpdate (state, payload) {
    state.pendingTrackingListUpdate = payload
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
