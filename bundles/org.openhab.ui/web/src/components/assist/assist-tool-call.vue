<template>
  <div class="system-message tool-call">
    <f7-icon f7="wrench_fill" size="14" />
    <div class="system-details">
      <span class="system-label">Tool Call</span>
      <span class="system-content">{{ content }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  content: string
}>()
</script>
