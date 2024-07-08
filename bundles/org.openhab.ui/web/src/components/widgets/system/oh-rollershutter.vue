<template>
  <f7-segmented round outline strong class="rollershutter-controls" :style="config.buttonStyle">
    <f7-button @click.stop="up()" large :icon-ios="upIcon" :icon-md="upIcon" :icon-aurora="upIcon" icon-size="24" icon-color="gray" />
    <f7-button v-if="config.stateInCenter" @click.stop="stop()" large class="state">
      <small>{{ context.store[config.item].state }}</small>
    </f7-button>
    <f7-button v-else @click.stop="stop()" large :icon-ios="stopIcon" :icon-md="stopIcon" :icon-aurora="stopIcon" icon-size="24" icon-color="red" />
    <f7-button @click.stop="down()" large :icon-ios="downIcon" :icon-md="downIcon" :icon-aurora="downIcon" icon-size="24" icon-color="gray" />
  </f7-segmented>
</template>

<style lang="stylus">
.rollershutter-controls
  .button
    height 48px
    width 48px
  .segmented-highlight
    display none
.aurora .rollershutter-controls
  .button
    height 37px
</style>

<script>
import mixin from '../widget-mixin'
import { OhRollershutterDefinition } from '@/assets/definitions/widgets/system'

export default {
  mixins: [mixin],
  widget: OhRollershutterDefinition,
  mounted () {
    delete this.config.value
  },
  computed: {
    upIcon (theme) {
      const dir = (this.config.vertical) ? 'left' : 'up'
      const style = this.config.dirIconsStyle || 'arrowtriangle_{dir}'
      return 'f7:' + style.replace('{dir}', dir)
    },
    downIcon (theme) {
      const dir = (this.config.vertical) ? 'right' : 'down'
      const style = this.config.dirIconsStyle || 'arrowtriangle_{dir}'
      return 'f7:' + style.replace('{dir}', dir)
    },
    stopIcon (theme) {
      const style = this.config.stopIconStyle || 'stop'
      return 'f7:' + style
    }
  },
  methods: {
    up (value) {
      this.$store.dispatch('sendCommand', { itemName: this.config.item, cmd: 'UP' })
    },
    down (value) {
      this.$store.dispatch('sendCommand', { itemName: this.config.item, cmd: 'DOWN' })
    },
    stop (value) {
      this.$store.dispatch('sendCommand', { itemName: this.config.item, cmd: 'STOP' })
    }
  }
}
</script>
