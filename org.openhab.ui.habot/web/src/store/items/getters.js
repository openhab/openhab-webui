import { sprintf } from 'sprintf-js'

const unique = a => [...new Set(a)]

export const objectSet = (state) => {
  if (!state.items.length) return []
  const tags = state.items.map((item) => {
    return item.tags || []
  }).reduce((acc, tags) => {
    return acc.concat(tags)
  }).filter((tag) => {
    return tag.indexOf('object:') === 0
  })
  return unique(tags)
}

export const locationSet = (state) => {
  if (!state.items.length) return []
  const tags = state.items.map((item) => {
    return item.tags || []
  }).reduce((acc, tags) => {
    return acc.concat(tags)
  }).filter((tag) => {
    return tag.indexOf('location:') === 0
  })
  return unique(tags)
}

export const allStates = (state) => {
  let states = {}
  for (let i of state.items) {
    states[i.name] = state.map[i.name]
  }
  return states
}

export const itemState = (state) => (name, raw) => {
  if (!state.items.length) return null
  let item = state.items.find(item => item.name === name)
  if (item && item.state) {
    let rawState = item.state
    let unit
    // handle Number items with dimension (unit suffixed to state)
    if (item.type.indexOf('Number:') === 0 && item.state.indexOf(' ') > 0) {
      rawState = item.state.split(' ')[0]
      unit = item.state.split(' ')[1]
    }
    if (raw) return rawState
    if (item.transformedState) {
      return item.transformedState
    } else if (item.stateDescription && item.stateDescription.pattern) {
      let pattern = (unit) ? item.stateDescription.pattern.replace('%unit%', unit) : item.stateDescription.pattern
      return sprintf(pattern, rawState)
    } else {
      return item.state
    }
  } else {
    return null
  }
}

export const name = (state) => (name) => {
  return state.items.find(item => item.name === name)
}
