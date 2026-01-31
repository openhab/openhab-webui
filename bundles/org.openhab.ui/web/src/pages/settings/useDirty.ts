import { ref, computed, type Ref, watch, onMounted } from 'vue'
import type { Router } from 'framework7'
import { showConfirmDialog } from '@/js/dialog-promises'
import fastDeepEqual from 'fast-deep-equal'
import cloneDeep from 'lodash/cloneDeep'

export async function confirmLeaveWithoutSaving(): Promise<boolean> {
  return showConfirmDialog('Do you want to leave this page without saving?', 'Discard Changes?')
}

export async function beforeLeave({
  resolve,
  reject,
  router,
  from,
  dirty
}: {
  resolve: () => void
  reject: () => void
  router: Router.Router
  from: Router.Route
  dirty: Ref<boolean>
}) {
  console.info('Checking dirty before leave ...')
  if (dirty.value) {
    const shouldLeave = await confirmLeaveWithoutSaving()
    if (shouldLeave) {
      router.allowPageChange = true
      resolve()
    } else {
      router.allowPageChange = false
      reject()
    }
  } else {
    resolve()
  }
}

/**
 * Tracks dirty state for a settings page.
 *
 * IMPORTANT: You must pass a ref to the page component/element (e.g. <f7-page ref="pageRef">).
 * useDirty attaches an internal dirty ref to that page DOM node so the Framework7 route
 * beforeLeave guard can detect unsaved changes.
 *
 * The dirty state can be manually set via the `dirty` ref, or automatically tracked by calling `setupDirtyWatch` with a reactive data object.
 *
 */
export function useDirty(pageRef: Ref<HTMLElement | { $el?: HTMLElement } | null>) {
  const dirty = ref<boolean>(false)
  const dirtyIndicator = computed(() => (dirty.value ? ' ●' : ''))

  onMounted(() => {
    const refValue = pageRef.value
    const targetEl = (refValue instanceof Element ? refValue : refValue?.$el) as Element | undefined
    if (targetEl) {
      if (!targetEl.classList.contains('page')) {
        console.error(
          'useDirty: The provided ref does not point to a page element. Please ensure you pass a ref to the <f7-page> element. Dirty tracking may not work as expected.'
        )
        return
      }
      ;(targetEl as Element & { __dirty: Ref<boolean> }).__dirty = dirty
    } else {
      console.error('useDirty: Unable to attach dirty ref to page element. Dirty tracking may not work as expected.')
    }
  })

  /**
   * Sets up change tracking for a reactive data object.
   *
   * Monitors the provided ref for deep changes and updates the dirty flag accordingly.
   * Captures the initial data state as the "pristine" baseline. When data changes from
   * the pristine state, dirty is set to true. When `dirty` is explicitly set to false
   * (e.g., after saving), the current data state becomes the new pristine baseline.
   *
   * @param value - The ref to watch for changes (typically your data model)
   * @param dirtyRef - Optional, currently unused (kept for API compatibility)
   */
  function setupDirtyWatch(value: Ref<unknown>, dirtyRef?: Ref<boolean>) {
    let pristineValue = cloneDeep(value.value)

    watch(dirty, (newValue) => {
      if (!newValue) {
        // Update the pristine value when dirty is set to false, e.g. after saving
        pristineValue = cloneDeep(value.value)
      }
    })

    watch(
      value,
      (newValue, oldValue) => {
        if (!oldValue) {
          // First time real data is loaded, capture it as pristine baseline
          pristineValue = cloneDeep(newValue)
          dirty.value = false
        } else {
          // After initial load, track changes against the pristine value, reset to false if value is cleared
          dirty.value = newValue ? !fastDeepEqual(newValue, pristineValue) : false
        }
      },
      { deep: true }
    )
  }

  return {
    dirty,
    dirtyIndicator,
    setupDirtyWatch
  }
}
