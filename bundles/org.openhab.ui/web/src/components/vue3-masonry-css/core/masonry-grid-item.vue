<template>
  <div :id="id" class="masonry-grid-item">
    <slot name="default" />
  </div>
</template>

<script setup lang="ts">
// @ts-expect-error   TODO-V3.1
import { utils } from 'framework7'
const id = utils.id()
</script>
