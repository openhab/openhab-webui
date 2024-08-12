import Vue from 'vue'

const state = {
  trackingList: [],
  itemStates: {},
  trackerConnectionId: null,
  trackerEventSource: null,
  pendingTrackingListUpdate: false,
  keepConnectionOpen: false,
  sseConnected: false
}

let stateTrackingProxy = null

const handler = (context) => {
  return {
    get (obj, prop) {
      if (prop === '_keys') return Object.keys(context.state.itemStates)
      if (prop === '__ob__') return obj.__ob__

      // to avoid the Vue devtools requesting invalid items in development
      if (['state', 'getters', '_vm', 'toJSON', '__v_isRef'].indexOf(prop.toString()) >= 0) return {}
      if (typeof prop !== 'string') return {}

      const itemName = prop
      if (!context.getters.isItemTracked(itemName)) {
        context.commit('addToTrackingList', itemName.toString())

        // Return the previous state anyway even if it might be outdated (it will be refreshed quickly after)
        if (!context.state.itemStates[itemName]) {
          context.commit('setItemState', { itemName, itemState: { state: '-' } })
        }

        context.dispatch('updateTrackingList')
      }
      return context.state.itemStates[itemName]
    },
    set (obj, prop, value) {
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
    console.debug('Initializing state tracking store proxy')
    stateTrackingProxy = new Proxy({}, handler(context))
  },
  startTrackingStates (context) {
    console.debug('Start tracking states')
    if (context.state.keepConnectionOpen && context.state.trackerEventSource) return
    context.commit('clearTrackingList')
    if (context.state.trackerEventSource) {
      console.debug('Closing existing state tracker connection')
      this._vm.$oh.sse.close(context.state.trackerEventSource)
      context.commit('clearStateTracker', null)
    }
    const eventSource = this._vm.$oh.sse.connectStateTracker('/rest/events/states',
      (connectionId) => {
        // only one state tracker at any given time!
        context.commit('setTrackerConnectionId', connectionId)
        const trackingListJson = JSON.stringify(context.state.trackingList)
        console.debug(`Setting initial tracking list (${context.state.trackingList.length} tracked Items): ` + trackingListJson)
        this._vm.$oh.api.postPlain('/rest/events/states/' + connectionId, trackingListJson, 'text/plain', 'application/json')
        context.commit('sseConnected', true)
      },
      (updates) => {
        for (const item in updates) {
          context.commit('setItemState', { itemName: item, itemState: updates[item] })
        }
      },
      () => {
        context.commit('sseConnected', false)
      },
      (healthy) => {
        context.commit('sseConnected', healthy)
      })
    context.commit('setTrackingEventSource', eventSource)
  },
  stopTrackingStates (context) {
    console.debug('Stop tracking states')
    if (context.state.keepConnectionOpen) return
    context.commit('clearTrackingList')
    if (context.state.trackerEventSource) {
      this._vm.$oh.sse.close(context.state.trackerEventSource)
    }
    context.commit('clearStateTracker', null)
  },
  updateTrackingList (context, payload) {
    if (!context.state.trackerConnectionId) {
      return
    }
    if (context.state.pendingTrackingListUpdate) {
      return
    }
    context.commit('setPendingTrackingListUpdate', true)
    Vue.nextTick(() => {
      context.commit('setPendingTrackingListUpdate', false)
      if (!context.state.trackerConnectionId) {
        return
      }
      const trackingListJson = JSON.stringify(context.state.trackingList)
      console.debug(`Updating tracking list (${context.state.trackingList.length} tracked Items): ` + trackingListJson)
      this._vm.$oh.api.postPlain('/rest/events/states/' + context.state.trackerConnectionId, trackingListJson, 'text/plain', 'application/json')
    })
  },
  sendCommand (context, { itemName, cmd, updateState }) {
    console.log(`Sending command to ${itemName}: ${cmd}`)
    if (updateState) {
      context.commit('setItemState', { itemName, itemState: { state: cmd } })
    }
    return this._vm.$oh.api.postPlain('/rest/items/' + itemName, cmd, 'text/plain', 'text/plain')
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
  keepConnectionOpen (state, value) {
    state.keepConnectionOpen = value
  },
  sseConnected (state, value) {
    state.sseConnected = value
  },
  setItemState (state, { itemName, itemState }) {
    Vue.set(state.itemStates, itemName.toString(), itemState)
    // state.itemStates[itemName] = itemState
  },
  setPendingTrackingListUpdate (state, payload) {
    state.pendingTrackingListUpdate = payload
  },
  clearStateTracker (state) {
    Vue.set(state, 'trackingList', [])
    state.trackerConnectionId = null
    state.trackerEventSource = null
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
