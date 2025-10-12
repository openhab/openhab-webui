<template>
  <div :class="config.class" :style="config.style" v-text="date" />
</template>

<script>
import dayjs from 'dayjs'
import mixin from '../widget-mixin'
import { actionsMixin } from '../widget-actions'
import { OhClockDefinition } from '@/assets/definitions/widgets/system'

export default {
  mixins: [mixin, actionsMixin],
  props: {
    format: String
  },
  widget: OhClockDefinition,
  data () {
    return {
      date: ''
    }
  },
  methods: {
    updateTime () {
      this.date = dayjs().format(this.format || this.config.format || 'LTS')
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
