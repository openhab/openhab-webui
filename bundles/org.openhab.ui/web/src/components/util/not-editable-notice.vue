<template>
  <f7-block>
    <f7-block-footer class="no-margin">
      <f7-icon f7="lock_fill" size="12" color="gray" />&nbsp;Note: This {{ subject }} is not editable because it has been provisioned from a
      file.
    </f7-block-footer>
  </f7-block>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    subject?: string
  }>(),
  {
    subject: 'page'
  }
)
</script>
