<template>
  <div v-bind="config">{{ config.text }}</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import type { WidgetContext } from './types'

const props = defineProps<{
  context: WidgetContext
}>()

const { config } = useWidgetContext(computed(() => props.context))
</script>
