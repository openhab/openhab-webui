<template>
  <oh-card :context="context" :content-class="['clock-card-content', 'text-align-center']">
    <template #content>
      <f7-row v-if="config.showDate && config.datePos !== 'below'">
        <f7-col>
          <oh-clock :context="{ component: { component: 'oh-clock', config: {} }}" :style="{ 'font-size': config.dateFontSize || '1vw', 'font-weight': config.dateFontWeight || 'normal' }" :format="config.dateFormat" />
        </f7-col>
      </f7-row>
      <f7-row>
        <f7-col>
          <oh-clock :context="{ component: { component: 'oh-clock', config: {} }}" :style="{ 'font-size': config.timeFontSize || '2vw', 'font-weight': config.timeFontWeight || 'normal' }" :format="config.timeFormat" />
        </f7-col>
      </f7-row>
      <f7-row v-if="config.showDate && config.datePos === 'below'">
        <f7-col>
          <oh-clock :context="{ component: { component: 'oh-clock', config: {} }}" :style="{ 'font-size': config.dateFontSize || '1vw', 'font-weight': config.dateFontWeight || 'normal' }" :format="config.dateFormat" />
        </f7-col>
      </f7-row>
    </template>
  </oh-card>
</template>

<script>
import mixin from '../widget-mixin'
import { actionsMixin } from '../widget-actions'
import OhCard from '@/components/widgets/standard/oh-card.vue'
import OhClock from '../system/oh-clock.vue'
import { OhClockCardDefinition } from '@/assets/definitions/widgets/standard/cards'

export default {
  mixins: [mixin, actionsMixin],
  components: {
    OhCard,
    OhClock
  },
  widget: OhClockCardDefinition
}
</script>
