import { extend } from 'quasar'

export const updateAll = (state, cards) => {
  console.log('Loaded ' + cards.length + ' cards')

  // for backward compatibility - convert old object: and location: tags
  // to attributes on the cards
  state.cards = cards.map((c) => {
    if (!c.objects) c.objects = []
    if (!c.locations) c.locations = []
    c.tags.forEach((t) => {
      if (t.indexOf('object:') === 0 && c.objects.indexOf(t.replace('object:', '')) < 0) c.objects.push(t.replace('object:', ''))
      if (t.indexOf('location:') === 0 && c.locations.indexOf(t.replace('object:', '')) < 0) c.locations.push(t.replace('location:', ''))
    })

    return c
  })
}

export const createCard = (state, card) => {
  state.cards.push(card)
}

export const updateCard = (state, payload) => {
  let idx = state.cards.findIndex((c) => c.uid === payload.uid)
  if (idx < 0) return
  state.cards.splice(idx, 1, extend(true, {}, payload))
}

export const bookmarkCard = (state, payload) => {
  let idx = state.cards.findIndex((c) => c.uid === payload.uid)
  if (idx < 0) return
  state.cards[idx].bookmarked = true
}

export const unbookmarkCard = (state, payload) => {
  let idx = state.cards.findIndex((c) => c.uid === payload.uid)
  if (idx < 0) return
  state.cards[idx].bookmarked = false
}

export const updateCardTimestamp = (state, payload) => {
  let idx = state.cards.findIndex((c) => c.uid === payload.uid)
  if (idx < 0) return
  state.cards[idx].timestamp = Date.now()
}

export const removeCard = (state, payload) => {
  let idx = state.cards.findIndex((c) => c.uid === payload.uid)
  if (idx < 0) return
  state.cards.splice(idx, 1)
}

export const setReady = (state) => {
  state.ready = true
}
