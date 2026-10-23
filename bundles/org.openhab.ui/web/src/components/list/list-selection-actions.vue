<template>
  <f7-link v-if="theme.md" icon-md="material:close" icon-color="white" @click="emit('close')" />
  <div v-if="theme.md" class="title">{{ count }} selected</div>
  <div :class="theme.md ? 'right' : 'display-flex justify-content-center'" :style="theme.md ? undefined : 'width: 100%; gap: 16px'">
    <template v-if="count > 0">
      <list-selection-action-link
        v-if="hasCopyAction"
        :text="$t('dialogs.copy')"
        tooltip="Copy selected"
        icon-ios="f7:square_on_square"
        icon-aurora="f7:square_on_square"
        icon-md="material:content_copy"
        :count="copyCount"
        color="theme-alt"
        @click="emit('copy')" />

      <slot name="extra-actions" :platform="platform" />

      <list-selection-action-link
        v-if="hasRemoveAction"
        :text="$t('dialogs.delete')"
        tooltip="Remove selected"
        icon-ios="f7:trash"
        icon-aurora="f7:trash"
        icon-md="material:delete"
        :count="removeCount"
        color="red"
        @click="emit('remove')" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'
import { theme } from 'framework7-vue'

import ListSelectionActionLink from './list-selection-action-link.vue'

export type ToolbarPlatform = 'ios' | 'aurora' | 'md'

/**
 * Contextual toolbar shown while selecting list items.
 * Renders Remove and Copy itself; additional page-specific actions go in the `extra-actions` slot.
 */
const props = defineProps<{
  copyCount?: number
  removeCount?: number
}>()

const emit = defineEmits<{
  close: []
  remove: []
  copy: []
}>()

defineSlots<{
  /** Extra actions, shown between Remove and Copy **/
  'extra-actions'(props: { platform: ToolbarPlatform }): unknown
}>()

const platform = computed<ToolbarPlatform>(() => (theme.md ? 'md' : theme.aurora ? 'aurora' : 'ios'))
const count = computed(() => Math.max(props.removeCount ?? 0, props.copyCount ?? 0))
const hasCopyAction = computed(() => Object.prototype.hasOwnProperty.call(getCurrentInstance()?.vnode.props, 'onCopy'))
const hasRemoveAction = computed(() => Object.prototype.hasOwnProperty.call(getCurrentInstance()?.vnode.props, 'onRemove'))
</script>
