import { computed, ref, watch } from 'vue'
import {
  getAdminSidebarCandidates,
  getDefaultAdminSidebarIds,
  getEffectiveAdminSidebarItems,
  type AdminMenuLinkItemDefinition,
  type AdminMenuSection
} from '@/js/admin-menu'
import { useRuntimeStore } from '@/js/stores/useRuntimeStore'
import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'

export function useSidebarAdminSubmenu(section: AdminMenuSection) {
  const runtimeStore = useRuntimeStore()
  const uiOptionsStore = useUIOptionsStore()
  const runtimeStoreLike = {
    apiEndpoint: (endpoint: string) => Boolean(runtimeStore.apiEndpoint(endpoint))
  }

  const draftSelectedIds = ref<string[]>([])
  const expandedState = ref(false)

  const items = computed<AdminMenuLinkItemDefinition[]>(() => {
    if (expanded.value) {
      return getAdminSidebarCandidates(section, runtimeStoreLike)
    }
    return getEffectiveAdminSidebarItems(section, runtimeStoreLike, uiOptionsStore.sidebarSubmenuSelections[section])
  })

  const candidates = computed<AdminMenuLinkItemDefinition[]>(() => {
    return getAdminSidebarCandidates(section, runtimeStoreLike)
  })

  const customizing = computed(() => uiOptionsStore.sidebarSubmenuCustomizationSection === section)
  const expanded = computed(() => !customizing.value && expandedState.value)

  const showAllSubmenuEntries = () => {
    expandedState.value = true
  }

  const collapseSubmenuEntries = () => {
    expandedState.value = false
  }

  const syncDraft = () => {
    draftSelectedIds.value = items.value.map((item) => item.id)
  }

  watch(customizing, (isCustomizing) => {
    if (isCustomizing) syncDraft()
  })

  const startCustomization = () => {
    uiOptionsStore.sidebarSubmenuCustomizationSection = section
  }

  const toggleDraft = (itemId: string) => {
    const selected = new Set(draftSelectedIds.value || [])
    if (selected.has(itemId)) {
      selected.delete(itemId)
    } else {
      selected.add(itemId)
    }
    draftSelectedIds.value = candidates.value.map((item) => item.id).filter((id) => selected.has(id))
  }

  const applyCustomization = () => {
    uiOptionsStore.sidebarSubmenuSelections = {
      ...uiOptionsStore.sidebarSubmenuSelections,
      [section]: [...(draftSelectedIds.value || [])]
    }
    uiOptionsStore.sidebarSubmenuCustomizationSection = null
  }

  const isCustomized = computed(() => {
    const defaultIds = getDefaultAdminSidebarIds(section, runtimeStoreLike)
    const selectedIds = draftSelectedIds.value
    return defaultIds.length !== selectedIds.length || !defaultIds.every((id) => selectedIds.includes(id))
  })

  const resetCustomization = () => {
    draftSelectedIds.value = getDefaultAdminSidebarIds(section, runtimeStoreLike)
  }

  const cancelCustomization = () => {
    syncDraft()
    if (customizing.value) {
      uiOptionsStore.sidebarSubmenuCustomizationSection = null
    }
  }

  return {
    items,
    candidates,
    expanded,
    customizing,
    draftSelectedIds,
    startCustomization,
    toggleDraft,
    applyCustomization,
    isCustomized,
    resetCustomization,
    cancelCustomization,
    showAllSubmenuEntries,
    collapseSubmenuEntries
  }
}
