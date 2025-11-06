import { defineStore } from 'pinia'
import { ref,reactive } from 'vue'

export interface MediaStoreState {
  mappings: Record<string, any>
  currentGlobalPlayerItem: string | null
  mediaBrowserMode: string | null
  playerItem: string | null
}

export const useMediaStore = defineStore('media', {
   state: (): MediaStoreState => ({
      mappings: reactive({}),
      currentGlobalPlayerItem: localStorage.getItem('currentGlobalPlayerItem'),
      mediaBrowserMode: localStorage.getItem('mediaBrowserMode'),
      playerItem: localStorage.getItem('playerItem'),
   }),
   actions: {
    setMapping(key: string, value: any) {
      this.mappings[key] = value
    },

    removeItem(key: string) {
      delete this.mappings[key]
    },

     setCurrentGlobalPlayerItem(playerItem: string | null) {
      this.currentGlobalPlayerItem = playerItem
      if (playerItem === null) {
        localStorage.removeItem('currentGlobalPlayerItem')
      } else {
        localStorage.setItem('currentGlobalPlayerItem', playerItem)
      }
    },

    setMediaBrowserMode(mode: string | null) {
      this.mediaBrowserMode = mode
      if (mode === null) {
        localStorage.removeItem('mediaBrowserMode')
      } else {
        localStorage.setItem('mediaBrowserMode', mode)
      }
    },

    setPlayerItem(playerItem: string | null) {
      this.playerItem = playerItem
      if (playerItem === null) {
        localStorage.removeItem('playerItem')
      } else {
        localStorage.setItem('playerItem', playerItem)
      }
    }
  }

})
