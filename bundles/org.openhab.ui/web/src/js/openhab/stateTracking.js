import Vue from 'vue'

const handler = {
  get (obj, prop) {
    if (prop === '_keys') return Object.keys(obj)
    if (obj[prop] === undefined) {
      console.debug(`need ${prop.toString()}`)
      Vue.set(obj, prop, '?' + prop.toString() + '?')
    }
    return obj[prop]
  },
  set (obj, prop, value) {
    console.debug(`setting ${prop.toString()} to ${value}`)
    Vue.set(obj, prop, value)
    return true
  }
}

function store (map) {
  return new Proxy(map, handler)
}

export default {
  data () {
    return {
      stateTracking: {
        stateTrackingEventSource: null,
        stateTrackerConnectionId: null,
        store: null,
        states: {}
      }
    }
  },
  watch: {
    'stateTracking.states': function (newValue) {
      if (!this.stateTracking.stateTrackerConnectionId) return
      this.$oh.api.postPlain('/rest/events/states/' + this.stateTracking.stateTrackerConnectionId, JSON.stringify(this.stateTracking.store._keys), 'text/plain', 'application/json')
    }
  },
  mounted () {
    this.stateTracking.store = store(this.stateTracking.states)
  },
  methods: {
    startStateTracking () {
      this.stateTracking.stateTrackingEventSource = this.$oh.sse.connectStateTracker('/rest/events/states',
        (connectionId) => {
          this.stateTracking.stateTrackerConnectionId = connectionId
          this.$oh.api.postPlain('/rest/events/states/' + this.stateTracking.stateTrackerConnectionId, JSON.stringify(this.stateTracking.store._keys), 'text/plain', 'application/json')
        },
        (updates) => {
          for (const item in updates) {
            this.stateTracking.store[item] = updates[item]
          }
        })
    },
    stopStateTracking () {
      this.$oh.sse.close(this.stateTracking.stateTrackingEventSource)
    },
    onCommand (itemName, cmd) {
      this.$oh.api.postPlain('/rest/items/' + itemName, cmd, 'text/plain', 'text/plain')
    }
  }
}
