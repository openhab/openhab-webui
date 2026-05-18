import { ref } from 'vue'

export function useTabs(initialTab: string = '') {
  const currentTab = ref(initialTab)

  function switchTab(tab: string, onSuccessCallback?: () => void) {
    if (currentTab.value !== tab) {
      currentTab.value = tab
      if (onSuccessCallback) {
        onSuccessCallback()
      }
    }
  }

  return {
    currentTab,
    switchTab
  }
}
