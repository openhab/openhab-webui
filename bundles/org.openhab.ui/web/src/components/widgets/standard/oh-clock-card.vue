<template>
  <oh-card :context="context" :content-class="['clock-card-content', 'text-align-center']">
    <!-- @vue-expect-error - required to ignore missing slot info on options api oh-card -->
    <template #content>
      <f7-row v-if="config.showDate && config.datePos !== 'below'">
        <f7-col>
          <oh-clock
            :context="clockContext"
            :style="{ 'font-size': config.dateFontSize || '1vw', 'font-weight': config.dateFontWeight || 'normal' }"
            :format="config.dateFormat"
            :timezone="config.timezone" />
        </f7-col>
      </f7-row>
      <f7-row>
        <f7-col>
          <oh-clock
            :context="clockContext"
            :style="{ 'font-size': config.timeFontSize || '2vw', 'font-weight': config.timeFontWeight || 'normal' }"
            :format="config.timeFormat"
            :timezone="config.timezone" />
        </f7-col>
      </f7-row>
      <f7-row v-if="config.showDate && config.datePos === 'below'">
        <f7-col>
          <oh-clock
            :context="clockContext"
            :style="{ 'font-size': config.dateFontSize || '1vw', 'font-weight': config.dateFontWeight || 'normal' }"
            :format="config.dateFormat"
            :timezone="config.timezone" />
        </f7-col>
      </f7-row>
    </template>
  </oh-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import OhCard from '@/components/widgets/standard/oh-card.vue'
import OhClock from '../system/oh-clock.vue'
import { OhClockCardDefinition } from '@/assets/definitions/widgets/standard/cards'
import type { WidgetContext } from '../types'

const props = defineProps<{
  context: WidgetContext
}>()

const { config } = useWidgetContext(computed(() => props.context))

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
