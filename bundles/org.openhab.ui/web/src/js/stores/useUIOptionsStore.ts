import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { Dom7 } from 'framework7'
import { f7 } from 'framework7-vue'

declare global {
  interface Window {
    OHApp?: {
      preferDarkMode: () => boolean
    }
  }
}

export const useUIOptionsStore = defineStore('uiOptions', () => {
  // States
  // shared with basicUI
  const _storedDarkMode = localStorage.getItem('openhab.ui:theme.dark')
  const storedDarkMode = ref<'auto' | 'dark' | 'light'>(
    _storedDarkMode === 'auto' || _storedDarkMode === 'dark' || _storedDarkMode === 'light'
      ? _storedDarkMode
      : 'auto'
  )

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

  // shared with basicUI
  const webAudio = ref<boolean>(localStorage.getItem('openhab.ui:webaudio.enable') === 'true')

  const visibleBreakpointDisabled = ref<boolean>(
    localStorage.getItem('openhab.ui:panel.visibleBreakpointDisabled') === 'true'
  )

  const _storedCodeEditorType = localStorage.getItem('openhab.ui:codeEditor.type') || 'YAML'
  const codeEditorType = ref<'DSL' | 'YAML'>(['DSL', 'YAML'].includes(_storedCodeEditorType as any) ? (_storedCodeEditorType as 'DSL' | 'YAML') : 'YAML')

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

  // Getters
  function getDarkMode () {
    if (storedDarkMode.value === 'auto') {
      return typeof window.OHApp?.preferDarkMode === 'function' ? window.OHApp.preferDarkMode() : f7.darkMode ? 'dark' : 'light'
    }

    return storedDarkMode.value
  }

  function isAutoDarkMode () {
    return storedDarkMode.value === 'auto'
  }

  // Actions
  function setDarkMode (value: 'auto' | 'dark' | 'light') {
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
    f7.emit('darkModeChange', getDarkMode())
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

  function updateClasses () {
    if (getDarkMode() === 'dark') {
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
      dark: getDarkMode(),
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
    getDarkMode,
    setDarkMode,
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
