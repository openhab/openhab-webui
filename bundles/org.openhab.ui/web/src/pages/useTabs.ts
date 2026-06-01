import { ref } from 'vue'

export function useTabs(initialTab: string = '') {
  const currentTab = ref(initialTab)

  function switchTab(tab: string, onSuccessCallback?: () => void | boolean | Promise<void | boolean>): boolean | Promise<boolean> {
    if (currentTab.value === tab) return true

    const callbackResult = onSuccessCallback?.()
    if (callbackResult instanceof Promise) {
      return callbackResult.then((resolvedValue) => {
        if (resolvedValue === false) return false
        currentTab.value = tab
        return true
      })
    }

    if (callbackResult === false) return false

    currentTab.value = tab
    return true
  }

  return {
    currentTab,
    switchTab
  }
}
