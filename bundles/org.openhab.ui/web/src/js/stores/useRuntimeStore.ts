import { defineStore } from 'pinia'
import { ref, reactive, watch } from 'vue'

import buildInfo from '@/assets/build-info'
import { convertJavaLocale } from '@/js/i18n-utils.ts'

import { useStatesStore } from '@/js/stores/useStatesStore'

import * as api from '@/api'

interface UIInfo {
  commit: string
}

export const useRuntimeStore = defineStore('runtime', () => {
  // States
  const apiVersion = ref<string | null>(null)
  const measurementSystem = ref<api.RootBean['measurementSystem'] | null>(null)
  const apiEndpoints = ref<api.Links[] | null>(null)
  const locale = ref<string>(import.meta.env.VUE_APP_I18N_LOCALE || 'en')
  const runtimeInfo = ref<object | null>(null)
  const uiInfo = ref<UIInfo>({ commit: buildInfo.commit })
  const websiteUrl = ref<string | null>(null)
  const docSrcUrl = ref<string | null>(null)
  const showDeveloperDock = ref<boolean>(false)
  const pagePath = ref<string | null>(null)
  const voiceIcon = ref<string | null>(null)
  const modelExpanded = ref<boolean>(false)
  const modelPickerExpanded = ref<boolean>(false)
  const modelSelectedItem = ref<object | null>(null)
  const modelExpandedTreeviewItems = ref<string[]>([])
  const ready = ref<boolean>(false)

  // Getters
  function apiEndpoint(type: string): string | null {
    return !apiEndpoints.value ? null : apiEndpoints.value?.find((e) => e.type === type)?.url || null
  }

  // Actions
  function setRootResource(rootResponse: api.RootBean) {
    locale.value = convertJavaLocale(rootResponse.locale)
    apiVersion.value = rootResponse.version
    measurementSystem.value = rootResponse.measurementSystem
    runtimeInfo.value = rootResponse.runtimeInfo
    apiEndpoints.value = rootResponse.links
    websiteUrl.value = `https://${rootResponse.runtimeInfo?.buildString !== 'Release Build' ? 'next' : 'www'}.openhab.org`
    docSrcUrl.value = `https://www.openhab.org/link/docs-src/${rootResponse.runtimeInfo.version.replace(/(\d+\.\d+)\.\d+(\.(M|RC)\d+)?/g, '$1.x')}`

    ready.value = true
  }

  watch(showDeveloperDock, (newValue) => {
    useStatesStore().keepConnectionOpen = newValue
  })

  return {
    apiVersion,
    measurementSystem,
    apiEndpoints,
    apiEndpoint,
    locale,
    runtimeInfo,
    uiInfo,
    websiteUrl,
    docSrcUrl,
    showDeveloperDock,
    pagePath,
    voiceIcon,
    modelExpanded,
    modelPickerExpanded,
    modelSelectedItem,
    modelExpandedTreeviewItems,
    ready,

    setRootResource
  }
})
