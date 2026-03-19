<template>
  <div :class="config.class" :style="config.style" v-text="date" />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import dayjs from 'dayjs'
import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import { OhClockDefinition } from '@/assets/definitions/widgets/system'

import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import type { WidgetContext } from '../types'

dayjs.extend(utc)
dayjs.extend(timezone)

const props = defineProps<{
  context: WidgetContext
  format?: string
  timezone?: string
}>()

defineOptions({
  widget: OhClockDefinition
})

console.log('clock context', props.context)

const { config } = useWidgetContext(props.context)

let timer: number
const date = ref<string>('')

function updateTime() {
  let dayjsDate = props.timezone || config.timezone ? dayjs().tz(props.timezone || config.timezone) : dayjs()
  date.value = dayjsDate.format(props.format || config.format || 'LTS')
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onBeforeUnmount(() => {
  clearInterval(timer)
})
</script>
