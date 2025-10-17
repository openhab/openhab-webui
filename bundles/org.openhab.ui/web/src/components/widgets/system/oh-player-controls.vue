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
    			@click="openBrowserPopup"/>
    <f7-button color="blue"   					
    			large 		
    			icon-material="speaker
    			icon-size="24" 
    			icon-color="gray"  
    			@click="openDeviceSelectorPopup"/>
				
	<media-popup :opened="browserPopupOpened"  :player-item="config.item"  @update:opened="browserPopupOpened = $event"/>
    <media-device-popup :opened="deviceSelectorPopupOpened"  :player-item="config.item"  @update:opened="deviceSelectorPopupOpened = $event"/>
               
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
import MediaPopup from '@/pages/media/media-popup.vue'
import MediaDevicePopup from '@/pages/media/media-device-selector-popup.vue'
import { useStatesStore } from '@/js/stores/useStatesStore'

export default {
  mixins: [mixin],
  widget: OhPlayerDefinition,
  mounted () {
    delete this.config.value
  },
  components: {        // ⚡ Ici on déclare le composant
    MediaPopup,
    MediaDevicePopup
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
      volume: 0,
      browserPopupOpened: false,
      deviceSelectorPopupOpened: false
    }
  },
  computed: {
    isPlaying () {
      this.decodeState()
      return this.state === 'PLAY'
    },
  methods: {
    openBrowserPopup() {
      this.browserPopupOpened = true
  },
    openDeviceSelectorPopup() {
      this.deviceSelectorPopupOpened = true
    },
    decodeState () {
      const value = this.context.store[this.config.item].state
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
          console.log("===========value:" + value)
          let components = value.split(',')
          this.state = components[0]
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
