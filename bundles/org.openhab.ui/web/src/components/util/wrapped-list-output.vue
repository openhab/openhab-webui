<!--
  NOTE: This component must be wrapped inside an <f7-list-group>
  to prevent Framework7's list parser from crashing on custom components.
-->
<template>
  <f7-list-input class="wrapped-list-output" type="text" :input="false" v-bind="$attrs">
    <template #input>
      <span class="text-content">
        {{ value }}
        <clipboard-icon v-if="clipboard && value" :value="value" :tooltip="tooltip" class="copy-icon" />
      </span>
    </template>
  </f7-list-input>
</template>

<style lang="stylus" scoped>
.wrapped-list-output
  height auto !important

  :deep(.item-content), :deep(.item-input-wrap)
    align-items flex-start !important
    height auto !important

  :deep(.item-title.item-label)
    align-self flex-start !important

  .text-content
    white-space normal !important
    word-break break-all !important
    display inline-flex
    gap 8px

    .copy-icon
      margin-top 5px
      pointer-events initial !important
</style>

<script setup lang="ts">
import ClipboardIcon from '@/components/util/clipboard-icon.vue'

withDefaults(
  defineProps<{
    value?: string
    clipboard?: boolean
    tooltip?: string
  }>(),
  {
    value: '',
    clipboard: false,
    tooltip: 'Copy'
  }
)
</script>
