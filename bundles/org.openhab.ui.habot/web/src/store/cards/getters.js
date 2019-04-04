import { extend } from 'quasar'

const unique = a => [...new Set(a)]

export const objectSet = (state) => {
  if (!state.cards.length) return []
  const objects = state.cards.map((card) => {
    return card.objects || []
  }).reduce((acc, objects) => {
    return acc.concat(objects)
  })
  return unique(objects)
}

export const locationSet = (state) => {
  if (!state.cards.length) return []
  const locations = state.cards.map((card) => {
    return card.locations || []
  }).reduce((acc, locations) => {
    return acc.concat(locations)
  })
  return unique(locations)
}

export const tagSet = (state) => {
  if (!state.cards.length) return []
  const tags = state.cards.map((card) => {
    return card.tags || []
  }).reduce((acc, tags) => {
    return acc.concat(tags)
  })
  return unique(tags)
}

export const object = (state) => (object) => {
  if (!state.cards.length) return []
  return state.cards.filter((card) => card.objects.indexOf(object) >= 0)
}

export const location = (state) => (location) => {
  if (!state.cards.length) return []
  return state.cards.filter((card) => card.locations.indexOf(location) >= 0)
}

export const filter = (state) => (objects, locations) => {
  if (!objects.length && !locations.length) return []
  if (!state.cards.length) return []
  let filtered = state.cards.slice()
  if (objects.length) {
    filtered = filtered.filter((card) => objects.some((t) => card.objects.indexOf(t) >= 0))
  }
  if (locations.length) {
    filtered = filtered.filter((card) => locations.some((t) => card.locations.indexOf(t) >= 0))
  }
  return filtered
}

export const all = (state) => {
  return state.cards
}

export const tagged = (state) => (tags) => {
  return state.cards.filter((c) => {
    return c.tags && tags.every((t) => c.tags.indexOf(t) >= 0)
  })
}

export const bookmarked = (state) => {
  if (!state.cards) return []
  return state.cards.filter(card => card.bookmarked)
}

export const single = (state) => (uid) => {
  if (!state.cards) return null
  let card = state.cards.find(c => c.uid === uid)
  return card
}

export const suggestioncandidates = (state) => {
  if (!state.cards) return []
  return state.cards.filter(card => card.config && card.config.suggestcriteria)
}

export const copy = (state) => (uid) => {
  if (!state.cards) return []
  let card = state.cards.find(c => c.uid === uid)
  if (!card) return null
  return card ? extend(true, {}, card) : null
}
