<template>
  <div :id="id" class="masonry-grid-item">
    <slot name="default" />
  </div>
</template>

<script setup lang="ts">
import { f7 } from 'framework7-vue'

const id = f7.utils.id()
</script>
