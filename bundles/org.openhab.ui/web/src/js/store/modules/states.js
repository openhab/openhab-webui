import Vue from 'vue'

const state = {
  trackingList: [],
  itemStates: {},
  trackerConnectionId: null,
  trackerEventSource: null,
  pendingTrackingListUpdate: false,
  keepConnectionOpen: false
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
        console.debug(`Proxy: need ${itemName.toString()}`)
        context.commit('addToTrackingList', itemName.toString())

        // Return the previous state anyway even if it might be outdated (it will be refreshed quickly after)
        if (!context.state.itemStates[itemName]) {
          context.commit('setItemState', { itemName: itemName, itemState: { state: '-' } })
        }

        context.dispatch('updateTrackingList')
        context.dispatch('retrieveItemInfo', itemName)
      }
      return context.state.itemStates[itemName]
    },
    set (obj, prop, value) {
      console.debug(`Proxy: setting ${prop.toString()} to ${value}`)
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
  retrieveItemInfo (context, itemName) {
    console.debug(`retrieving item info ${itemName}`)
    this._vm.$oh.api.get(`/rest/items/${itemName}`).then((item) => {
      context.commit('setItemInfo', { itemName: itemName, itemInfo: item })
    })
  },
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
        console.debug('Setting initial tracking list: ' + trackingListJson)
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
      console.debug('updateTrackingList: No connection id, not calling the API')
      return
    }
    if (context.state.pendingTrackingListUpdate) {
      console.debug('updateTrackingList: Pending tracking list update, not calling the API')
      return
    }
    context.commit('setPendingTrackingListUpdate', true)
    Vue.nextTick(() => {
      context.commit('setPendingTrackingListUpdate', false)
      if (!context.state.trackerConnectionId) {
        console.debug('updateTrackingList: No connection id, not calling the API')
        return
      }
      const trackingListJson = JSON.stringify(context.state.trackingList)
      console.debug('Updating tracking list: ' + trackingListJson)
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
  setItemState (state, { itemName, itemState }) {
    // get the existing item state (potentially with extra info)
    // and overwrite with recieved state
    itemState = { ...state.itemStates[itemName], ...itemState }
    Vue.set(state.itemStates, itemName.toString(), itemState)
    // state.itemStates[itemName] = itemState
  },
  setItemInfo (state, { itemName, itemInfo }) {
    // get the existing item state and set the info (keeping the original state intact)
    itemInfo = { ...itemInfo, ...state.itemStates[itemName] }
    Vue.set(state.itemStates, itemName.toString(), itemInfo)
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
