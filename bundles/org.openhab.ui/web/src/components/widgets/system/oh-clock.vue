<template>
  <div :class="config.class" :style="config.style" v-text="date" />
</template>

<script>
import dayjs from 'dayjs'
import { actionsMixin } from '../widget-actions'
import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import { OhClockDefinition } from '@/assets/definitions/widgets/system'

export default {
  mixins: [actionsMixin],
  props: {
    context: Object,
    format: String
  },
  widget: OhClockDefinition,
  setup (props) {
    const { config } = useWidgetContext(props.context)
    return { config }
  },
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
  beforeUnmount () {
    clearInterval(this.timer)
  }
}
</script>
