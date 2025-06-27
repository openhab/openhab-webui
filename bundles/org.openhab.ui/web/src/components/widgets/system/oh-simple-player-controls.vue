<template>
  <div>
    <f7-segmented round outline strong class="player-controls" title="">
      <f7-button color="blue" @click.stop="skipPrevious()" large icon-material="skip_previous" icon-size="24" icon-color="gray" />
      <f7-button color="blue" @click.stop="rewind()" large icon-material="fast_rewind" icon-size="24" icon-color="gray" />
      <f7-button color="blue" @click.stop="playPause()" large round fill :icon-f7="(isPlaying) ? 'pause_fill' : 'play_fill'" icon-size="24" />
      <f7-button color="blue" @click.stop="fastForward()" large icon-material="fast_forward" icon-size="24" icon-color="gray" />
      <f7-button color="blue" @click.stop="skipNext()" large icon-material="skip_next" icon-size="24" icon-color="gray" />

      <f7-button color="blue" large icon-f7="hifispeaker_fill" icon-size="24" icon-color="gray" :href="mediaDeviceSelectorUri" />
    </f7-segmented>
  </div>
</template>

<style lang="stylus">
.player-controls
  .button
    height 48px
  .segmented-highlight
    display none
.aurora .player-controls
  .button
    height 37px
</style>

<script>
import mixin from '../widget-mixin'
import { OhPlayerDefinition } from '@/assets/definitions/widgets/system'

export default {
  mixins: [mixin],
  widget: OhPlayerDefinition,
  mounted () {
  },
  computed: {
    isPlaying () {
      /*
      const value = this.context.store[this.config.item].state
      let components = value.split(',')
      let state = components[0]
      console.log('isPlaying', value, this.config.item, state)
      return state === 'PLAY'
      */
     return false;
    },
    mediaDeviceSelectorUri () {
      return '/mediadevicepopup/?binding=Upnp'
    }
  },
  methods: {
    skipPrevious (value) {
      this.$store.dispatch('sendCommand', { itemName: this.config.item, cmd: 'PREVIOUS' })
    },
    rewind (value) {
      this.$store.dispatch('sendCommand', { itemName: this.config.item, cmd: 'REWIND' })
    },
    playPause (value) {
      this.$store.dispatch('sendCommand', { itemName: this.config.item, cmd: this.isPlaying ? 'PAUSE' : 'PLAY' })
    },
    fastForward (value) {
      this.$store.dispatch('sendCommand', { itemName: this.config.item, cmd: 'FASTFORWARD' })
    },
    skipNext (value) {
      this.$store.dispatch('sendCommand', { itemName: this.config.item, cmd: 'NEXT' })
    }

  }
}
</script>
