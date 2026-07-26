import { defineStore } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import { Dom7 } from 'framework7'
import { f7, f7ready } from 'framework7-vue'
import { useStorage, useStorageAsync, type Serializer } from '@vueuse/core'
import { OHStorage } from '@/js/openhab/ohStorage'

const storedDarkModeOptions = ['auto', 'dark', 'light'] as const
export type StoredDarkModeOption = (typeof storedDarkModeOptions)[number]

const barsOptions = ['light', 'filled'] as const
export type BarsOption = (typeof barsOptions)[number]

const homeNavBarOptions = ['default', 'simple', 'large'] as const
export type HomeNavBarOption = (typeof homeNavBarOptions)[number]

const homeBackgroundOptions = ['default', 'standard', 'white'] as const
export type HomeBackgroundOption = (typeof homeBackgroundOptions)[number]

const codeEditorTypeOptions = ['DSL', 'YAML'] as const
export type CodeEditorType = (typeof codeEditorTypeOptions)[number]

// Helper serializer to ensure read value is one of the allowed values, otherwise return null
/*
export const serializerLimitToValues = (allowedValues: readonly string[]): Serializer<any> => ({
  read: (raw: any) => {
    return allowedValues.includes(raw as string)
      ? (raw as string)
      : null
  },
  // @eslint-disable-next-line
  write: (value: any) => value
})
*/

const syncSettingsStorageKey = 'openhab.ui:syncSettings'

export const serializerLimitToValues = <T extends string>(
  allowedValues: readonly T[],
): Serializer<T | null> => ({
  read: (raw: unknown): T | null => {
    if (typeof raw !== 'string') return null
    return allowedValues.includes(raw as T) ? (raw as T) : null
  },
  write: (value: T | null): string => value ?? '',
})

export const useUIOptionsStore = defineStore('uiOptions', () => {
  // States
  const syncSettings = useStorage<boolean>(syncSettingsStorageKey, false)   // Local
  const ready = ref(false)

  const ohStorage = new OHStorage(syncSettings.value, 'openhab.ui:', 'ui:')

  const _storedDarkMode = useStorageAsync<StoredDarkModeOption>('theme.dark', 'auto', ohStorage )
  const bars = useStorageAsync<BarsOption>('theme.bars', 'light', ohStorage )
  const homeNavBar = useStorageAsync<HomeNavBarOption>('theme.home.navbar', 'default', ohStorage )
  const homeBackground = useStorageAsync<HomeBackgroundOption>('theme.home.background', 'default', ohStorage )
  const _storedExpandableCardAnimation = useStorageAsync<string>('theme.home.cardanimation', 'default', ohStorage)
  const blocklyRenderer = useStorageAsync<string | null>('blockly.renderer', null, ohStorage)
  const disableLeftPanelSwipe = useStorageAsync<boolean>('theme.disableLeftPanelSwipe', false, ohStorage)
  const disablePageTransitionAnimation = useStorageAsync<boolean>('theme.disablePageTransition', false, ohStorage)
  const hideChatInput = useStorageAsync<boolean>('theme.hideChatInput', false, ohStorage)
  const logDockHeight = useStorageAsync<number>('theme.logDockHeight', 300, ohStorage)
  const webAudio = useStorageAsync<boolean>('theme.webAudio', true, ohStorage)
  const visibleBreakpointDisabled = useStorageAsync<boolean>('theme.visibleBreakpointDisabled', false, ohStorage)
  const codeEditorType = useStorageAsync<CodeEditorType>('codeEditor.type', 'YAML', ohStorage )
  const dialogIdentifier = useStorageAsync<string>('dialog.id', '', ohStorage)
  const dialogEnabled = useStorageAsync<boolean>('dialog.enabled', false, ohStorage)
  const dialogTriggerOnConnect = useStorageAsync<boolean>('dialog.triggerOnLaunch', false, ohStorage)
  const dialogListeningItem = useStorageAsync<string>('dialog.listeningItem', '', ohStorage)
  const dialogLocationItem = useStorageAsync<string>('dialog.locationItem', '', ohStorage)
  const dialogConnectOnWindowEvent = useStorageAsync<boolean>('dialog.connectOnWindowEvent', false, ohStorage)

  const storedDarkMode = computed<StoredDarkModeOption>({
    get: () => {
      return _storedDarkMode.value
    },
    set: (value: StoredDarkModeOption) => {
      _storedDarkMode.value = (value === 'auto') ? null : value
    }
  })
  const darkModeChange = ref<number>(0) // Used to trigger recomputation of darkMode

  // TODO: simplify to just store the boolean value
  const disableExpandableCardAnimation = computed<boolean>({
    get: () => {
      return _storedExpandableCardAnimation.value === 'disabled'
    },
    set: (value: boolean) => {
      _storedExpandableCardAnimation.value = value ? 'disabled' : 'default'
    }
  })

  ready.value = true

  if (!dialogIdentifier.value.length) {
    dialogIdentifier.value = `ui-${Math.round(Math.random() * 100)}-${Math.round(Math.random() * 100)}`
  }

  const modelPickerShowItemName = useStorageAsync<boolean>('modelPicker.showItemName', false)
  const modelPickerShowItemTags = useStorageAsync<boolean>('modelPicker.showItemTags', false)
  const modelPickerShowNonSemantic = useStorageAsync<boolean>('modelPicker.showNonSemantic', false)

  const sitemapShowItemName = useStorageAsync<boolean>('sitemap.showItemName', false)


  // TODO: old version used comma separated list, this uses JSON.stringify
  const assistSelectedLlmTools = useStorageAsync<string[] | null>('assist.llmtools.selected', null)
  const assistShowGenericToolVisualisation = useStorageAsync<boolean>('assist.showGenericToolVisualisation', false)

  const codeMirrorSettings = reactive({
    vimMode: localStorage.getItem('openhab.ui:codeMirror.vimMode') === 'true'
  })

  // TODO: move to setup wizard
  const setupWizardShort = useStorageAsync<boolean>('setupWizard.short', false)
  const setupWizardStepsDone = useStorageAsync<Record<string, boolean>>('setupWizard.stepsDone', {})

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
    set: (value: StoredDarkModeOption) => {
      storedDarkMode.value = value
      if (value === 'auto') {
        f7.enableAutoDarkMode()
      } else {
        f7.disableAutoDarkMode()
      }

      bars.value = 'light' // Reset bars to light when dark mode changes
      updateClasses()
    }
  })

  const autoDarkMode = computed(() => storedDarkMode.value === 'auto')

  f7ready(() => {
    darkModeChange.value++ // trigger computed darkMode now f7 is ready
    updateClasses()
    f7.on('darkModeChange', () => {
      darkModeChange.value++
      updateClasses()
    })
  })

  // Watchers
  watch(syncSettings, (newValue) => {
    ohStorage.setSyncWithServer(newValue)
  })

  watch(bars, (newValue) => {
    updateClasses()
  })

  watch(disableLeftPanelSwipe, (newValue) => {
    if (newValue) {
      f7.panel.get('left').disableSwipe()
    } else {
      f7.panel.get('left').enableSwipe()
    }
  })

  watch(disablePageTransitionAnimation, (newValue) => {
    updateClasses()
  })

  watch(dialogEnabled, (newValue) => {
    setTimeout(() => {
      location.reload()
    }, 50)
  })

  watch(codeMirrorSettings, (newValue) => {
    localStorage.setItem('openhab.ui:codeMirror.vimMode', newValue.vimMode ? 'true' : 'false')
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

  function themeOptions() {
    return {
      dark: darkMode.value,
      autoDarkMode: autoDarkMode.value,
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
    syncSettings,
    ready,
    storedDarkMode,
    darkMode,
    autoDarkMode,
    bars,
    homeNavBar,
    homeBackground,
    disableExpandableCardAnimation,
    blocklyRenderer,
    disableLeftPanelSwipe,
    disablePageTransitionAnimation,
    hideChatInput,
    webAudio,
    visibleBreakpointDisabled,
    codeEditorType,
    modelPickerShowItemName,
    modelPickerShowItemTags,
    modelPickerShowNonSemantic,
    sitemapShowItemName,
    logDockHeight,
    dialogEnabled,
    dialogIdentifier,
    dialogListeningItem,
    dialogLocationItem,
    dialogConnectOnWindowEvent,
    dialogTriggerOnConnect,
    assistSelectedLlmTools,
    assistShowGenericToolVisualisation,

    codeMirrorSettings,
    setupWizardShort,
    setupWizardStepsDone,

    updateClasses,
    themeOptions
  }
})
