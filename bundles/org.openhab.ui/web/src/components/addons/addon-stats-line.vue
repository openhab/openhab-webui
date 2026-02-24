<template>
  <span v-if="addon.properties" class="addon-stats-line">
    <span v-if="likes >= 0">
      <f7-icon f7="heart_fill" :size="iconSize" />
      {{ likes }}
    </span>
    <span v-if="views >= 0">
      <f7-icon f7="eye_fill" :size="iconSize" />
      {{ views }}
    </span>
    <span v-if="posts >= 0">
      <f7-icon f7="chat_bubble_fill" :size="iconSize" />
      {{ posts }}
    </span>
  </span>
</template>

<style lang="stylus">
.addon-stats-line
  white-space nowrap
  & > span
    margin-right 4px
</style>

<script setup lang="ts">
import { computed } from 'vue'
import * as api from '@/api'

// props
const props = defineProps<{ addon: api.Addon, iconSize: string | number }>()

// computed
// @ts-expect-error: like_count is not typed
const likes = computed<number>(() => props.addon.properties?.like_count ?? 0)
// @ts-expect-error: views is not typed
const views = computed<number>(() => props.addon.properties?.views ?? 0)
// @ts-expect-error: posts_count is not typed
const posts = computed<number>(() => props.addon.properties?.posts_count ?? 0)
</script>
