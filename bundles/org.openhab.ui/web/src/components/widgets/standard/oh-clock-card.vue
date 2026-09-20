<template>
  <oh-card :context="context" :content-class="['clock-card-content', 'text-align-center']">
    <!-- @vue-expect-error - required to ignore missing slot info on options api oh-card -->
    <template #content>
      <f7-row v-if="config.showDate && config.datePos !== 'below'">
        <f7-col>
          <oh-clock
            class="date-clock"
            :context="clockContext"
            :style="{ 'font-size': config.dateFontSize, 'font-weight': config.dateFontWeight }"
            :format="config.dateFormat"
            :timezone="config.timezone" />
        </f7-col>
      </f7-row>
      <f7-row>
        <f7-col>
          <oh-clock
            class="time-clock"
            :context="clockContext"
            :style="{ 'font-size': config.timeFontSize, 'font-weight': config.timeFontWeight }"
            :format="config.timeFormat"
            :timezone="config.timezone" />
        </f7-col>
      </f7-row>
      <f7-row v-if="config.showDate && config.datePos === 'below'">
        <f7-col>
          <oh-clock
            class="date-clock"
            :context="clockContext"
            :style="{ 'font-size': config.dateFontSize, 'font-weight': config.dateFontWeight }"
            :format="config.dateFormat"
            :timezone="config.timezone" />
        </f7-col>
      </f7-row>
    </template>
  </oh-card>
</template>

<style scoped lang="stylus">
.row .col
  container-type inline-size

  :deep(div)
    white-space nowrap
    font-weight normal

  :deep(div.time-clock)
      font-size clamp(1.2rem, 10cqw, 3rem)

  :deep(div.date-clock)
      font-size clamp(.9rem, 6cqw, 2rem)
</style>

<script setup lang="ts">
import { computed } from 'vue'
import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import OhCard from '@/components/widgets/standard/oh-card.vue'
import OhClock from '../system/oh-clock.vue'
import { OhClockCardDefinition } from '@/assets/definitions/widgets/standard/cards'
import type { WidgetContext } from '../types'
import { OhClockCard as OhClockCardType } from '@/types/components/widgets'

const props = defineProps<{
  context: WidgetContext
}>()

const { config } = useWidgetContext<OhClockCardType.Config>(
  computed(() => props.context),
  OhClockCardType.isConfig
)

const clockContext: WidgetContext = {
  component: {
    component: 'oh-clock',
    config: {}
  },
  config: {},
  props: {},
  parent: props.context
}

defineOptions({
  widget: OhClockCardDefinition
})
</script>
