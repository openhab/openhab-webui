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
    			icon-f7="folder_fill" 
    			icon-size="24" 
    			icon-color="gray"  
    			:href="mediaBrowserUri"/>
    <f7-button color="blue"   					
    			large 		
    			icon-f7="hifispeaker_fill" 	
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
  computed: {
    isPlaying () {
      const value = this.context.store[this.config.item].state
      var components = value.split(',');
      var state = components[0];
      console.log ("isPlaying", value, this.config.item, state);
      return state === 'PLAY'
    },
    mediaBrowserUri () {
        return "/mediapopup/?item=" + this.config.item;
      },
    mediaDeviceSelectorUri () {
        const value = this.context.store[this.config.item].state
        var components = value.split(',');
        var device = components[3];
        var binding = components[4];
        console.log ("device is ", device);
        console.log ("binding is ", binding);
        return "/mediadevicepopup/?item=" + this.config.item + "&device=" + device + "&binding=" + binding;
    }
  },
  methods: {
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
