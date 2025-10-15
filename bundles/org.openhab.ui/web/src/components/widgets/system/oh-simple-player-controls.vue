<template>
  <div >
    <f7-segmented round outline strong class="player-controls" title="" style="vertical-align: bottom;height:45px;padding-top:5px;">
      <f7-button color="blue" @click.stop="skipPrevious()" large icon-material="skip_previous" icon-size="24" icon-color="gray" style="vertical-align: middle;display: flex;"/>
      <f7-button color="blue" @click.stop="rewind()" large icon-material="fast_rewind" icon-size="24" icon-color="gray" style="vertical-align: middle;display: flex;"/>
      <f7-button color="blue" @click.stop="playPause()" large round fill :icon-f7="(isPlaying) ? 'pause_fill' : 'play_fill'" icon-size="24" style="vertical-align: middle;display: flex;"/>
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
  watch: {
    '$store.state.media.currentGlobalPlayerName'(newVal) {
        this.item = this.$store.state.media.currentGlobalPlayerItem
    },
    '$store.state.media.currentGlobalPlayerItem'(newVal) {
      this.item = this.$store.state.media.currentGlobalPlayerItem
    }
  },
  data: function () {
    if (this.item=== undefined || this.item === null || this.item === '') {
      this.item = this.$store.state.media.currentGlobalPlayerItem
    }
    
    return {
      item: this.item,
      state: '',
      device: '',
      binding:'',
      artistName: '',
      trackName: '',
      artUri: '',
      trackPosition: 0,
      trackDuration: 0,
      volume: 0
    }
  },
  mounted () {
   
  },
  computed: {
    isPlaying () {
      this.decodeState()
      return this.state === 'PLAY'
    },
    mediaDeviceSelectorUri () {
      return '/mediadevicepopup/?binding=Upnp'
    }
  },
  methods: {
    decodeState () {
      const value = this.$store.getters.trackedItems[this.item].state
      if (!(value === undefined || value === null || value === '' || value==='-')) {
        if (value.indexOf('{') === 0) {
          let json = JSON.parse(value);
          this.state = json.state;
          this.device = json.device.value;
          this.binding = json.binding.value;
          this.artistName = json.currentPlayingArtistName.value;
          this.trackName = json.currentPlayingTrackName.value;
          this.artUri = json.currentPlayingArtUri.value;
          this.trackPosition = json.currentPlayingTrackPosition.value;
          this.trackDuration = json.currentPlayingTrackDuration.value;
          this.volume = json.currentPlayingVolume.value;
        } else {
          let components = value.split(',')
          let state = components[0]
        }
      }
    },
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
