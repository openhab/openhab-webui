import type { PiniaPluginContext } from 'pinia'
import {} from '@/api'

export function piniaPersistencePlugin({ store, options }: PiniaPluginContext) {
  const persistTo = options?.persistTo
  if (!persistTo) return

  if (persistTo === 'local') {
    // Handle legacy stores that share keys with Basic UI
    if (store.$id === 'uiOptions') {
      // Let the store read its own raw, individual keys during initialization.

      // Listen for mutations to write back to those specific keys
      store.$subscribe((mutation, state: any) => {
        if (state.storedDarkMode) localStorage.setItem('openhab.ui:theme.dark', state.storedDarkMode)
        if (state.bars) localStorage.setItem('openhab.ui:theme.bars', state.bars)
        if (state.homeNavBar) localStorage.setItem('openhab.ui:theme.home.navbar', state.homeNavBar)
      })

      store.isReady = Promise.resolve()
      return
    }

    const localData = localStorage.getItem(`openhab.ui:store:${store.$id}`)
    if (localData) {
      store.$patch(JSON.parse(localData))
    }

    store.isReady = Promise.resolve()

    store.$subscribe((mutation, state) => {
      localStorage.setItem(`openhab.ui:store:${store.$id}`, JSON.stringify(state))
    })
  }

  if (persistTo === 'server') {
    store.isReady = Promise.resolve() // Replace with actual API call

    // Listen for changes and send them to the server with a debounce
    let timeoutId: any = null
    store.$subscribe((mutation, state) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        console.log(`PUT /rest/ui/store/${store.$id}`, JSON.stringify(state)) // Replace with actual API call
      }, 500)
    })
  }
}
