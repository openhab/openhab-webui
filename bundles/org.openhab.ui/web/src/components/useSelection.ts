import { computed, ref, type Ref } from 'vue'

/**
 * Multi-select state for list pages.
 * @param filteredUids UIDs currently visible (e.g. `filteredUids` from useSearch)
 */
export function useSelection(filteredUids: Ref<string[]>) {
  const selected = ref(new Set<string>()) // persists across filter changes
  const selectionMode = ref(false)

  /** Selected UIDs that are also visible; use for counts and bulk actions. */
  const selectedInFilter = computed(() => new Set(filteredUids.value.filter((uid) => selected.value.has(uid))))
  const allSelected = computed(() => filteredUids.value.length > 0 && filteredUids.value.every((uid) => selected.value.has(uid)))

  const isSelected = (uid: string) => selected.value.has(uid)

  function clearSelection() {
    selected.value.clear()
  }

  /** Enter or leave selection mode; leaving clears the selection. */
  function toggleSelectionMode() {
    selectionMode.value = !selectionMode.value
    if (!selectionMode.value) clearSelection()
  }

  function selectDeselectAll() {
    if (allSelected.value) clearSelection()
    else selected.value = new Set(filteredUids.value)
  }

  /** Toggle one UID, entering selection mode if needed. */
  function toggleItemSelection(uid: string) {
    selectionMode.value = true
    if (!selected.value.delete(uid)) selected.value.add(uid)
  }

  /** Ctrl/Meta-click: toggle, and leave selection mode when nothing is left selected. */
  function ctrlClick(uid: string) {
    toggleItemSelection(uid)
    if (selected.value.size === 0) selectionMode.value = false
  }

  return {
    selected,
    selectionMode,
    selectedInFilter,
    allSelected,
    isSelected,
    clearSelection,
    toggleSelectionMode,
    selectDeselectAll,
    toggleItemSelection,
    ctrlClick
  }
}
