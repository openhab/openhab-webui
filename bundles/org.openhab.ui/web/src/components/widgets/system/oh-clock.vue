<template>
  <div :class="config.class" :style="config.style" v-text="date" />
</template>

<script>
import dayjs from 'dayjs'
import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import { OhClockDefinition } from '@/assets/definitions/widgets/system'
import { useWidgetAction } from '@/components/widgets/useWidgetAction.ts'

export default {
  props: {
    context: Object,
    format: String
  },
  widget: OhClockDefinition,
  setup (props) {
    const { config, evaluateExpression } = useWidgetContext(props.context)
    const { performAction } = useWidgetAction(props.context, config, evaluateExpression)
    return { config, performAction }
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
