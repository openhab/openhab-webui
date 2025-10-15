<template>
  <div>
  <f7-segmented v-bind="config"
                round
                outline
                strong
                class="player-controls"
                title="">
    <f7-button color="blue"
               @click.stop="skipPrevious()"
               large
               icon-material="skip_previous"
               icon-size="24"
               icon-color="gray" />
    <f7-button v-if="this.config.showRewindFFward"
               color="blue"
               @click.stop="rewind()"
               large
               icon-material="fast_rewind"
               icon-size="24"
               icon-color="gray" />
    <f7-button color="blue"
               @click.stop="playPause()"
               large
               round
               fill
               :icon-f7="(isPlaying) ? 'pause_fill' : 'play_fill'"
               icon-size="24" />
    <f7-button v-if="this.config.showRewindFFward"
               color="blue"
               @click.stop="fastForward()"
               large
               icon-material="fast_forward"
               icon-size="24"
               icon-color="gray" />
    <f7-button color="blue"
               @click.stop="skipNext()"
               large
               icon-material="skip_next"
               icon-size="24"
               icon-color="gray" />
    <f7-button color="blue"   			 
    			large 
    			icon-material="folder" 
    			icon-size="24" 
    			icon-color="gray"  
    			:href="mediaBrowserUri"/>
    <f7-button color="blue"   					
    			large 		
    			icon-material="speaker
    			icon-size="24" 
    			icon-color="gray"  
    			:href="mediaDeviceSelectorUri"/>
               
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

import { useStatesStore } from '@/js/stores/useStatesStore'

export default {
  mixins: [mixin],
  widget: OhPlayerDefinition,
  mounted () {
    delete this.config.value
  },
  data () {
    return {
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
  computed: {
    isPlaying () {
      const value = this.context.store[this.config.item].state
      this.decodeState()
      return this.state === 'PLAY'
    },
    mediaBrowserUri () {
        const value = this.context.store[this.config.item].state
        this.decodeState()
		return '/mediapopup/?item=' + this.config.item + '&device=' + this.device + '&binding=' + this.binding
      },
    mediaDeviceSelectorUri () {
        const value = this.context.store[this.config.item].state
        var components = value.split(',');
        var device = components[3];
        var binding = components[4];
        console.log ("device is ", device);
        console.log ("binding is ", binding);
        return "/mediadevicepopup/?item=" + this.config.item + "&device=" + this.device + "&binding=" + this.binding;
    }
  },
  methods: {
    decodeState () {
      const value = this.context.store[this.config.item].state
      console.log('=============a:', value);
      if (!(value === undefined || value === null || value === '' || value==='-')) {
        console.log('=============b');
        if (value.indexOf('{') === 0) {
          console.log('=============c');
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
          console.log('=============d:' + this.state);
        } else {
          let components = value.split(',')
          let state = components[0]
        }
      }
    },
    skipPrevious (value) {
      useStatesStore().sendCommand(this.config.item, 'PREVIOUS')
    },
    rewind (value) {
      useStatesStore().sendCommand(this.config.item, 'REWIND')
    },
    playPause (value) {
      useStatesStore().sendCommand(this.config.item, this.isPlaying ? 'PAUSE' : 'PLAY')
    },
    fastForward (value) {
      useStatesStore().sendCommand(this.config.item, 'FASTFORWARD')
    },
    skipNext (value) {
      useStatesStore().sendCommand(this.config.item, 'NEXT')
    },
    mediaChange (value) {
      //this.$store.dispatch('sendCommand', { itemName: this.config.item, cmd: 'spotify:playlist:5Z4AD0u9fwnvtsj7ce5ZLS' 
      })
    }
}
</script>
