import { ref, computed, type Ref, watch, onMounted, useTemplateRef } from 'vue'
import type { Router } from 'framework7'
import { showConfirmDialog } from '@/js/dialog-promises'
import fastDeepEqual from 'fast-deep-equal/es6'
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
      resolve()
    } else {
      router.allowPageChange = true
      reject()
    }
  } else {
    resolve()
  }
}

type PageRef = HTMLElement | { $el?: HTMLElement } | null

/**
 * Tracks unsaved-change state for a page and exposes helpers for both manual and automatic dirty tracking.
 *
 * When a page ref is provided, this composable attaches the returned `dirty` ref to the page DOM element
 * as `__dirty` during `onMounted`. The Framework7 route guard can then read that value before navigation
 * and prompt the user if there are unsaved changes.
 *
 * Dirty state can be managed in two ways:
 * - manually by setting `dirty.value`
 * - automatically by calling `setupDirtyWatch()` with a reactive ref containing the data being edited
 *
 * `setupDirtyWatch()` stores a deep-cloned pristine snapshot of the current value and compares future
 * updates against that snapshot. When `dirty.value` is later reset to `false` after a successful save,
 * the current value becomes the new pristine baseline.
 *
 * Pass either:
 * - the string name of a template ref declared on the page component/element, for example
 *   `<f7-page ref="pageRef">`
 * - or the ref object itself
 * - or `null` when dirty tracking is needed without attaching navigation protection to a page element
 *
 * The page ref may resolve either to a DOM element or to a component instance exposing `$el`.
 *
 * @param pageRefOrName Template ref name, page ref object, or `null` if no page element should be bound.
 * @returns An object containing:
 * - `dirty`: reactive boolean indicating whether the page has unsaved changes
 * - `dirtyIndicator`: computed string suitable for appending to titles, returning `" ●"` when dirty
 * - `setupDirtyWatch`: helper that derives dirty state from a reactive value
 */
export function useDirty(pageRefOrName: string | Ref<PageRef> | null) {
  const dirty = ref<boolean>(false)
  const dirtyIndicator = computed(() => (dirty.value ? ' ●' : ''))
  const pageRef = pageRefOrName ? (typeof pageRefOrName === 'string' ? useTemplateRef<PageRef>(pageRefOrName) : pageRefOrName) : null

  if (pageRef) {
    onMounted(() => {
      const targetEl = pageRef.value instanceof Element ? pageRef.value : pageRef.value?.$el
      if (targetEl) {
        if (!targetEl.classList.contains('page')) {
          console.error(
            'useDirty: The provided ref does not point to a page element. Please ensure you pass a ref to the <f7-page> element. Dirty tracking may not work as expected.'
          )
          return
        }
        ;(targetEl as Element & { __dirty?: Ref<boolean> }).__dirty = dirty
      } else {
        console.error('useDirty: Unable to attach dirty ref to page element. Dirty tracking may not work as expected.')
      }
    })
  }

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
        if (oldValue === undefined) {
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
