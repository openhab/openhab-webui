import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { Dom7 } from 'framework7'
import { f7, f7ready } from 'framework7-vue'

type StoredDarkModeType = 'auto' | 'dark' | 'light'

declare global {
  interface Window {
    OHApp?: {
      preferDarkMode: () => boolean
    }
  }
}

export const useUIOptionsStore = defineStore('uiOptions', () => {
  // States
  const _storedDarkMode = localStorage.getItem('openhab.ui:theme.dark')
  const storedDarkMode = ref<StoredDarkModeType>(
    ['auto', 'dark', 'light'].includes(_storedDarkMode as any) ? (_storedDarkMode as StoredDarkModeType) : 'auto'
  )
  const darkModeChange = ref<number>(0) // Used to trigger recomputation of darkMode

  const _storedBars = localStorage.getItem('openhab.ui:theme.bars') || 'light'
  const bars = ref<'light' | 'filled'>(
    ['light', 'filled'].includes(_storedBars as any) ? (_storedBars as 'light' | 'filled') : 'light'
  )

  const _storedNavBar = localStorage.getItem('openhab.ui:theme.home.navbar') || 'default'
  const homeNavBar = ref<'default' | 'simple' | 'large'>(
    ['default', 'simple', 'large'].includes(_storedNavBar as any)
      ? (_storedNavBar as 'default' | 'simple' | 'large')
      : 'default'
  )

  const _storedHomeBackground =
    localStorage.getItem('openhab.ui:theme.home.background') || 'default'
  const homeBackground = ref<'default' | 'standard' | 'white'>(
    ['default', 'standard', 'white'].includes(_storedHomeBackground as any)
      ? (_storedHomeBackground as 'default' | 'standard' | 'white')
      : 'default'
  )

  const _storedExpandableCardAnimation =
    localStorage.getItem('openhab.ui:theme.home.cardanimation') || 'default'
  const disableExpandableCardAnimation = ref<boolean>(_storedExpandableCardAnimation === 'disabled')

  const blocklyRenderer = ref<string | null>(
    localStorage.getItem('openhab.ui:blockly.renderer')
  )
  const disablePageTransitionAnimation = ref<boolean>(
    localStorage.getItem('openhab.ui:theme.disablepagetransition') === 'true'
  )

  const hideChatInput = ref<boolean>(
    localStorage.getItem('openhab.ui:theme.home.hidechatinput') === 'true'
  )

  const webAudio = ref<boolean>(localStorage.getItem('openhab.ui:webaudio.enable') === 'true')

  const visibleBreakpointDisabled = ref<boolean>(
    localStorage.getItem('openhab.ui:panel.visibleBreakpointDisabled') === 'true'
  )

  const codeEditorType = ref<string>(localStorage.getItem('openhab.ui:codeEditor.type') || 'YAML')

  const modelPickerShowItemName = ref<boolean>(
    localStorage.getItem('openhab.ui:modelPicker.showItemName') === 'true'
  )
  const modelPickerShowItemTags = ref<boolean>(
    localStorage.getItem('openhab.ui:modelPicker.showItemTags') === 'true'
  )
  const modelPickerShowNonSemantic = ref<boolean>(
    localStorage.getItem('openhab.ui:modelPicker.showNonSemantic') === 'true'
  )

  const sitemapShowItemName = ref<boolean>(
    localStorage.getItem('openhab.ui:sitemap.showItemName') === 'true'
  )

  const darkMode = computed({
    get: (): 'dark' | 'light' => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      darkModeChange.value // darkModeChange to force re-computation
      if (storedDarkMode.value === 'auto') {
        if (typeof window.OHApp?.preferDarkMode === 'function') {
          return window.OHApp.preferDarkMode() == 'dark' ? 'dark' : 'light'
        }
        return f7.darkMode ? 'dark' : 'light'
      }
      return storedDarkMode.value
    },
    set: (value: StoredDarkModeType) => {
      storedDarkMode.value = value
      if (value === 'auto') {
        f7.enableAutoDarkMode()
        localStorage.removeItem('openhab.ui:theme.dark')
      } else {
        f7.disableAutoDarkMode()
        localStorage.setItem('openhab.ui:theme.dark', value)
      }

      bars.value = 'light' // Reset bars to light when dark mode changes
      updateClasses()
    }
  })

  f7ready(() => {
    darkModeChange.value++ // trigger computed darkMode now f7 is ready
    updateClasses()
    f7.on('darkModeChange', () => {
      darkModeChange.value++
      updateClasses()
    })
  })

  // Getters
  function isAutoDarkMode() {
    return storedDarkMode.value === 'auto'
  }

  watch(bars, (newValue) => {
    localStorage.setItem('openhab.ui:theme.bars', newValue)
    updateClasses()
  })

  watch(disablePageTransitionAnimation, (newValue) => {
    localStorage.setItem('openhab.ui:theme.disablepagetransition', newValue.toString())
    updateClasses()
  })

  watch(homeNavBar, (newValue) => {
    localStorage.setItem('openhab.ui:theme.home.navbar', newValue)
  })

  watch(disableExpandableCardAnimation, (newValue) => {
    localStorage.setItem('openhab.ui:theme.home.cardanimation', newValue ? 'disabled' : 'default')
  })

  watch(homeBackground, (newValue) => {
    localStorage.setItem('openhab.ui:theme.home.background', newValue)
  })

  watch(blocklyRenderer, (newValue) => {
    if (newValue === null) {
      localStorage.removeItem('openhab.ui:blockly.renderer')
    } else {
      localStorage.setItem('openhab.ui:blockly.renderer', newValue)
    }
  })

  watch(hideChatInput, (newValue) => {
    localStorage.setItem('openhab.ui:theme.home.hidechatinput', newValue.toString())
  })

  watch(webAudio, (newValue) => {
    localStorage.setItem('openhab.ui:webaudio.enable', newValue ? 'true' : 'false')
  })

  watch(visibleBreakpointDisabled, (newValue) => {
    localStorage.setItem('openhab.ui:panel.visibleBreakpointDisabled', newValue.toString())
  })

  watch(codeEditorType, (newValue) => {
    localStorage.setItem('openhab.ui:codeEditor.type', newValue)
  })

  watch(modelPickerShowItemName, (newValue) => {
    localStorage.setItem('openhab.ui:modelPicker.showItemName', newValue?.toString())
  })
  watch(modelPickerShowItemTags, (newValue) => {
    localStorage.setItem('openhab.ui:modelPicker.showItemTags', newValue?.toString())
  })
  watch(modelPickerShowNonSemantic, (newValue) => {
    localStorage.setItem('openhab.ui:modelPicker.showNonSemantic', newValue?.toString())
  })

  watch(sitemapShowItemName, (newValue) => {
    localStorage.setItem('openhab.ui:sitemap.showItemName', newValue?.toString())
  })

  function updateClasses() {
    if (darkMode.value === 'dark') {
      Dom7('html').addClass('dark')
    } else {
      Dom7('html').removeClass('dark')
    }
    if (bars.value === 'filled') {
      Dom7('html').addClass('theme-filled')
    } else {
      Dom7('html').removeClass('theme-filled')
    }
    if (disablePageTransitionAnimation.value) {
      Dom7('html').addClass('no-page-transitions')
    } else {
      Dom7('html').removeClass('no-page-transitions')
    }
  }

  function themeOptions () {
    return {
      dark: darkMode.value,
      autoDarkMode: isAutoDarkMode(),
      bars: bars.value,
      homeNavBar: homeNavBar.value,
      homeBackground: homeBackground.value,
      disableExpandableCardAnimation: disableExpandableCardAnimation.value,
      blocklyRenderer: blocklyRenderer.value,
      disablePageTransitionAnimation: disablePageTransitionAnimation.value,
      hideChatInput: hideChatInput.value,
      webAudio: webAudio.value,
      visibleBreakpointDisabled: visibleBreakpointDisabled.value
    }
  }

  return {
    storedDarkMode,
    darkMode,
    isAutoDarkMode,
    bars,
    homeNavBar,
    homeBackground,
    disableExpandableCardAnimation,
    blocklyRenderer,
    disablePageTransitionAnimation,
    hideChatInput,
    webAudio,
    visibleBreakpointDisabled,
    codeEditorType,
    modelPickerShowItemName,
    modelPickerShowItemTags,
    modelPickerShowNonSemantic,
    sitemapShowItemName,

    updateClasses,
    themeOptions
  }
})
