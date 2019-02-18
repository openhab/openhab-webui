/*
export const someMutation = (state) => {}
 */
import { extend } from 'quasar'

export const updateAll = (state, items) => {
  console.log('Loaded ' + items.length + ' items')
  state.items = items
  for (let i of items) {
    state.map[i.name] = i
  }
}

export const updateOne = (state, payload) => {
  console.log('Updating ' + payload.itemName + ' state to ' + payload.newState + (payload.newTransformedState ? ' (' + payload.newTransformedState + ')' : ''))
  let item = state.items.find((i) => i.name === payload.itemName)
  item.state = payload.newState
  if (payload.newTransformedState) {
    item.transformedState = payload.newTransformedState
  }
  state.map = extend({}, state.map)
  state.map[payload.itemName] = item
}

export const setReady = (state) => {
  state.ready = true
}
