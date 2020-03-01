<template>
  <f7-segmented round outline strong class="player-controls">
    <f7-button color="blue" @click="skipPrevious()" large icon-material="skip_previous" icon-size="24" icon-color="gray" />
    <f7-button color="blue" @click="playPause()" large round fill :icon-f7="(isPlaying) ? 'pause_fill' : 'play_fill'" icon-size="24" />
    <f7-button color="blue" @click="skipNext()" large icon-material="skip_next" icon-size="24" icon-color="gray" />
  </f7-segmented>
</template>

<style lang="stylus">
.player-controls
  .button
    height 48px
.aurora .player-controls
  .button
    height 37px
</style>

<script>
import mixin from '../widget-mixin'

export default {
  name: 'oh-slider',
  mixins: [mixin],
  mounted () {
    delete this.config.value
  },
  computed: {
    isPlaying () {
      const value = this.context.store[this.config.item]
      return value === 'PLAY'
    }
  },
  methods: {
    skipPrevious (value) {
      this.$store.dispatch('sendCommand', { itemName: this.config.item, cmd: 'PREVIOUS' })
    },
    playPause (value) {
      this.$store.dispatch('sendCommand', { itemName: this.config.item, cmd: this.isPlaying ? 'PAUSE' : 'PLAY' })
    },
    skipNext (value) {
      this.$store.dispatch('sendCommand', { itemName: this.config.item, cmd: 'NEXT' })
    }
  }
}
</script>
