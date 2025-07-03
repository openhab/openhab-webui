<template>
  <div >
    <f7-segmented round outline strong class="player-controls" title="" style="vertical-align: bottom;height:45px;padding-top:5px;">
      <f7-button color="blue" @click.stop="skipPrevious()" large icon-material="skip_previous" icon-size="24" icon-color="gray" style="vertical-align: middle;display: flex;"/>
      <f7-button color="blue" @click.stop="rewind()" large icon-material="fast_rewind" icon-size="24" icon-color="gray" style="vertical-align: middle;display: flex;"/>
      <f7-button color="blue" @click.stop="playPause()" large round fill :icon-material="(isPlaying) ? 'pause_fill' : 'play_fill'" icon-size="24" style="vertical-align: middle;display: flex;"/>
      <f7-button color="blue" @click.stop="fastForward()" large icon-material="fast_forward" icon-size="24" icon-color="gray" style="vertical-align: middle;display: flex;"/>
      <f7-button color="blue" @click.stop="skipNext()" large icon-material="skip_next" icon-size="24" icon-color="gray" style="vertical-align: middle;display: flex;"/>
      <f7-button color="blue" large icon-material="speaker" icon-size="24" icon-color="gray" :href="mediaDeviceSelectorUri" style="vertical-align: middle;display: flex;"/>
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
  data: function () {
    if (this.item=== undefined || this.item === null || this.item === '') {
      this.item = this.$store.state.media.currentGlobalPlayerItem
    }
    
    return {
      item: this.item
    }
  },
  mounted () {
   
  },
  computed: {
    isPlaying () {
      if (this.$store.getters.trackedItems[this.item]!= undefined) {
        const value = this.$store.getters.trackedItems[this.item].state
        if (value === undefined || value === null || value === '') {
          return false
        }
        if (value==='-') {
          return false
        }
        var mediaType = JSON.parse(value);
        return mediaType.state === 'PLAY'
      } 

      return false
    },
    mediaDeviceSelectorUri () {
      return '/mediadevicepopup/?binding=Upnp'
    }
  },
  methods: {
    skipPrevious (value) {
      this.$store.dispatch('sendCommand', { itemName: this.item, cmd: 'PREVIOUS' })
    },
    rewind (value) {
      this.$store.dispatch('sendCommand', { itemName: this.item, cmd: 'REWIND' })
    },
    playPause (value) {
      this.$store.dispatch('sendCommand', { itemName: this.item, cmd: this.isPlaying ? 'PAUSE' : 'PLAY' })
    },
    fastForward (value) {
      this.$store.dispatch('sendCommand', { itemName: this.item, cmd: 'FASTFORWARD' })
    },
    skipNext (value) {
      this.$store.dispatch('sendCommand', { itemName: this.item, cmd: 'NEXT' })
    }

  }
}
</script>
