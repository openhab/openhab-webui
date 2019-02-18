export const setReady = (state) => {
  state.ready = true
}

export const setUsingStoredCredentials = (state) => {
  state.usingStoredCredentials = true
}

export const setLang = (state, payload) => {
  state.lang = payload
}
