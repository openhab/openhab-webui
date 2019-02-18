import axios from 'axios'

export const initialLoad = (context, credential) => {
  let initialRequests = () => {
    return context.dispatch('cards/initialLoad')
      .then(() => {
        context.dispatch('items/initialLoad')
          .then(() => {
            context.dispatch('items/watchEvents', credential)
          })
        return context.commit('setReady')
      })
  }

  if (credential) {
    axios.defaults.headers.common['Authorization'] = 'Basic ' + btoa(credential.id + ':' + credential.password)
    context.commit('setUsingStoredCredentials')
    return initialRequests()
  } else {
    return initialRequests()
  }
}
