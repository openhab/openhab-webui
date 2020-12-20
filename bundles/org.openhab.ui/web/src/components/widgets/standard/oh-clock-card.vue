<template>
  <f7-card :no-border="config.noBorder" :no-shadow="config.noShadow" :outline="config.outline" :style="{ background: config.background }">
    <f7-card-header v-if="config.title">
      <div>{{config.title}}</div>
    </f7-card-header>
    <f7-card-content @click.native="performAction" class="clock-card-content text-align-center">
      <f7-row v-if="config.showDate && config.datePos !== 'below'">
        <f7-col :style="{ 'font-size': config.dateFontSize || '1vw', 'font-weight': config.dateFontWeight || 'normal' }" v-text="date"></f7-col>
      </f7-row>
      <f7-row>
        <f7-col :style="{ 'font-size': config.timeFontSize || '2vw', 'font-weight': config.timeFontWeight || 'normal' }" v-text="time"></f7-col>
      </f7-row>
      <f7-row v-if="config.showDate && config.datePos === 'below'">
        <f7-col :style="{ 'font-size': config.dateFontSize || '1vw', 'font-weight': config.dateFontWeight || 'normal' }" v-text="date"></f7-col>
      </f7-row>
    </f7-card-content>
    <f7-card-footer v-if="config.footer">
      {{config.footer}}
    </f7-card-footer>
  </f7-card>
</template>

<script>
import dayjs from 'dayjs'
import mixin from '../widget-mixin'
import { actionsMixin } from '../widget-actions'
import { OhClockCardDefinition } from '@/assets/definitions/widgets/standard/cards'

export default {
  data () {
    return {
      time: '',
      date: ''
    }
  },
  mixins: [mixin, actionsMixin],
  widget: OhClockCardDefinition,
  methods: {
    updateTime () {
      this.time = dayjs().format(this.config.timeFormat || 'LTS')
      this.date = dayjs().format(this.config.dateFormat || 'LL')
    }
  },
  mounted () {
    this.updateTime()
    this.timer = setInterval(this.updateTime, 1000)
  },
  beforeDestroy () {
    clearInterval(this.timer)
  }
}
</script>
