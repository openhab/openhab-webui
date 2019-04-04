import axios from 'axios'
import Vue from 'vue'

export const initialLoad = (context) => {
  if (context.state.cards.length) return Promise.resolve()
  console.log('Fetching all cards...')

  return new Promise((resolve, reject) => {
    axios.get('/rest/habot/cards').then((resp) => {
      context.commit('updateAll', resp.data)
      context.commit('setReady')
      resolve()
    }).catch(err => {
      reject(err)
    })
  })
}

export const create = (context, card) => {
  let request = (window && window.location && window.location.host === 'home.myopenhab.org')
    ? axios.post('/rest/habot/compat/cards', JSON.stringify(card), { headers: { 'Content-Type': 'text/plain' } })
    : axios.post('/rest/habot/cards', card)

  return request.then((resp) => {
    context.commit('createCard', card)

    return Promise.resolve(card)
  }).catch((err) => {
    return Promise.reject(err)
  })
}

export const update = (context, card) => {
  let request = (window && window.location && window.location.host === 'home.myopenhab.org')
    ? axios.post('/rest/habot/compat/cards/' + card.uid, JSON.stringify(card), { headers: { 'Content-Type': 'text/plain' } })
    : axios.put('/rest/habot/cards/' + card.uid, card)

  return request.then((resp) => {
    context.commit('updateCard', card)

    return Promise.resolve(card)
  }).catch((err) => {
    return Promise.reject(err)
  })
}

export const bookmark = (context, card) => {
  return axios.put('/rest/habot/cards/' + card.uid + '/bookmark', null, { headers: { 'Content-Type': 'text/plain' } }).then((resp) => {
    context.commit('bookmarkCard', card)

    return Promise.resolve(card)
  }).catch((err) => {
    return Promise.reject(err)
  })
}

export const unbookmark = (context, card) => {
  let request = (window && window.location && window.location.host === 'home.myopenhab.org')
    ? axios.post('/rest/habot/compat/cards/' + card.uid + '/unbookmark', null, { headers: { 'Content-Type': 'text/plain' } })
    : axios.delete('/rest/habot/cards/' + card.uid + '/bookmark')

  return request.then((resp) => {
    context.commit('unbookmarkCard', card)

    return Promise.resolve(card)
  }).catch((err) => {
    return Promise.reject(err)
  })
}

export const remove = (context, card) => {
  let request = (window && window.location && window.location.host === 'home.myopenhab.org')
    ? axios.post('/rest/habot/compat/cards/' + card.uid + '/delete', null, { headers: { 'Content-Type': 'text/plain' } })
    : axios.delete('/rest/habot/cards/' + card.uid)

  return request.then((resp) => {
    context.commit('removeCard', card)

    // return deleted card for undo purposes
    return Promise.resolve(card)
  }).catch((err) => {
    return Promise.reject(err)
  })
}

export const updateTimestamp = (context, card) => {
  return axios.put('/rest/habot/cards/' + card.uid + '/timestamp', null, { headers: { 'Content-Type': 'text/plain' } }).then((resp) => {
    context.commit('updateCardTimestamp', card)

    return Promise.resolve(card)
  }).catch((err) => {
    return Promise.reject(err)
  })
}

export const computeSuggestions = (context) => {
  let cards = []
  let candidates = context.state.cards.filter(card => card.config && card.config.suggestcriteria)

  let promises = []

  for (let card of candidates) {
    promises.push(Vue.prototype.$expr('=' + card.config.suggestcriteria).then((result) => {
      if (result === true) {
        cards.push(card)
      }
    }))
  }

  return Promise.all(promises).then(() => {
    return cards
  })
}
