<template>
  <f7-card :no-border="config.noBorder" :no-shadow="config.noShadow" :outline="config.outline" :style="{ background: config.background }">
    <f7-card-header v-if="config.title">
      <div>{{ config.title }}</div>
    </f7-card-header>
    <f7-card-content @click.native="performAction" class="clock-card-content text-align-center">
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
    </f7-card-content>
    <oh-card-footer v-if="config.footer" :texts="config.footer" />
  </f7-card>
</template>

<script>
import mixin from '../widget-mixin'
import { actionsMixin } from '../widget-actions'
import OhClock from '../system/oh-clock.vue'
import OhCardFooter from '../system/oh-card-footer.vue'
import { OhClockCardDefinition } from '@/assets/definitions/widgets/standard/cards'

export default {
  mixins: [mixin, actionsMixin],
  components: {
    OhClock,
    OhCardFooter
  },
  widget: OhClockCardDefinition
}
</script>
