<template>
  <div class="system-message tool-return">
    <f7-icon f7="checkmark_circle_fill" size="14" />
    <div class="system-details">
      <span class="system-label">Result</span>
      <span class="system-content">{{ content }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  content: string
}>()
</script>
