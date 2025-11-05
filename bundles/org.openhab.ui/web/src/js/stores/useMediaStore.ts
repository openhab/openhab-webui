import { defineStore } from 'pinia'
import { ref } from 'vue'

interface PlayerItem {
  commit: string
}

interface MediaBrowseMode {
  commit: string
}

//  currentGlobalPlayerItem: localStorage.getItem('currentGlobalPlayerItem'),
//  mediaBrowserMode: localStorage.getItem('mediaBrowserMode'),
//  playerItem: localStorage.getItem('playerItem')

export const useMediaStore = defineStore('media', () => {
  const currentGlobalPlayerItem = ref<PlayerItem | null>(null)
  const curentPlayerItem = ref<PlayerItem | null>(null)
  const mediaBrowseMode = ref<MediaBrowseMode | null>(null)

  function setCurrentGlobalPlayerItem(playerItem : PlayerItem | null) {
    currentGlobalPlayerItem.value = playerItem
    localStorage.setItem('currentGlobalPlayerItem', "" + curentPlayerItem.value)
  }
  function setMediaBrowserMode(mode : MediaBrowseMode | null) {
    mediaBrowseMode.value = mode
    localStorage.setItem('mediaBrowserMode', "" + mediaBrowseMode.value)
  }

  function setPlayerItem(playerItem : PlayerItem | null) {
    curentPlayerItem.value = playerItem
    localStorage.setItem('playerItem', "" + curentPlayerItem.value)
  }

  return { setCurrentGlobalPlayerItem, setMediaBrowserMode, setPlayerItem }
})
