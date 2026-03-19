<template>
  <div :class="config.class" :style="config.style" v-text="date" />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import dayjs from 'dayjs'
import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import { OhClockDefinition } from '@/assets/definitions/widgets/system'

import utc from 'dayjs/plugin/utc'
import timezoneDayjs from 'dayjs/plugin/timezone'
import type { WidgetContext } from '../types'

dayjs.extend(utc)
dayjs.extend(timezoneDayjs)

const props = defineProps<{
  context: WidgetContext,
  format?: string,
  timezone?: string
}>()

defineOptions({
  widget: OhClockDefinition
})

const { config } = useWidgetContext(props.context)

let timer: number
const date = ref<string>('')

function updateTime() {
  let dayjsDate = dayjs()
  try {
    if (props.timezone || config.value.timezone) {
      dayjsDate = dayjs().tz(props.timezone || config.value.timezone)
    }
  } catch (error) {
    date.value = 'Invalid timezone settings'
    return
  }
  date.value = dayjsDate.format(props.format || config.value.format || 'LTS')
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onBeforeUnmount(() => {
  clearInterval(timer)
})
</script>
