<template>
  <div v-bind="config">{{ config.text }}</div>
</template>

<script setup lang="ts">
import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import type { WidgetContext } from './types'

const props = defineProps<{
  context: WidgetContext
}>()

const { config } = useWidgetContext(props.context)
</script>
