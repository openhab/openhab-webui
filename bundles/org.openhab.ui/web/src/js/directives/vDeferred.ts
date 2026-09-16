import type { Directive, DirectiveBinding } from 'vue'

interface DeferredElement extends HTMLElement {
  __deferredTimer__?: ReturnType<typeof setTimeout>
}

/**
 * v-deferred
 *
 * Delays the visual rendering of its target DOM element to prevent UI "flicker"
 * during fast network requests or quick page transitions.
 *
 * Note: Must be used with `v-if` or `v-else-if` (not `v-show`) so Vue lifecycle
 * hooks (`mounted` / `unmounted`) trigger properly to manage the timer.
 *
 * @example <f7-col v-if="!ready" v-deferred> ... </f7-col>
 * @example <f7-col v-if="!ready" v-deferred="300"> ... </f7-col>
 */
export const vDeferred: Directive = {
  mounted(el: DeferredElement, binding: DirectiveBinding<number | undefined>) {
    const originalVisibility = el.style.visibility
    el.style.visibility = 'hidden'

    const delay = typeof binding.value === 'number' ? binding.value : 500

    el.__deferredTimer__ = setTimeout(() => {
      el.style.visibility = originalVisibility
      delete el.__deferredTimer__
    }, delay)
  },

  unmounted(el: DeferredElement) {
    if (el.__deferredTimer__) {
      clearTimeout(el.__deferredTimer__)
      delete el.__deferredTimer__
    }
  }
}

export default vDeferred
