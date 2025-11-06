<template>
  <div >
    <f7-segmented round outline strong class="player-controls" title="" style="vertical-align: bottom;height:45px;padding-top:5px;">
      <f7-button color="blue" @click.stop="skipPrevious()" large icon-material="skip_previous" icon-size="24" icon-color="gray" style="vertical-align: middle;display: flex;"/>
      <f7-button color="blue" @click.stop="rewind()" large icon-material="fast_rewind" icon-size="24" icon-color="gray" style="vertical-align: middle;display: flex;"/>
      <f7-button color="blue" @click.stop="playPause()" large round fill :icon-f7="(isPlaying) ? 'pause_fill' : 'play_fill'" icon-size="24" style="vertical-align: middle;display: flex;"/>
      <f7-button color="blue" @click.stop="fastForward()" large icon-material="fast_forward" icon-size="24" icon-color="gray" style="vertical-align: middle;display: flex;"/>
      <f7-button color="blue" @click.stop="skipNext()" large icon-material="skip_next" icon-size="24" icon-color="gray" style="vertical-align: middle;display: flex;"/>

      <f7-button color="blue" large icon-material="speaker" icon-size="24" icon-color="gray" @click="openDeviceSelectorPopup" style="vertical-align: middle;display: flex;"/>
      <media-device-selector-popup :opened="deviceSelectorPopupOpened"  :player-item="currentPlayerItem"  @update:opened="deviceSelectorPopupOpened = $event" :f7route="f7route" :f7router="f7router"/>

      <f7-button color="blue" large icon-material="queue_music" icon-size="24" icon-color="gray" href="/mediabrowser/?path=/Root/CurrentQueue" style="vertical-align: middle;display: flex;"/>
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
import MediaDeviceSelectorPopup from '@/pages/media/media-device-selector-popup.vue'
import { useMediaStore } from '@/js/stores/useMediaStore'
import { useStatesStore } from '@/js/stores/useStatesStore'
import { useComponentsStore } from '@/js/stores/useComponentsStore'

export default {
  mixins: [mixin],
  props: {
    f7route: Object, 
    f7router: Object
  },
  widget: OhPlayerDefinition,
  watch: {
    'useMediaStore().currentGlobalPlayerItem'(newVal) {
        this.currentPlayerItem = useMediaStore().currentGlobalPlayerItem
    }
  },
   components: {        // ⚡ Ici on déclare le composant
    MediaDeviceSelectorPopup
  },
  data: function () {
    let currentPlayerItem = useMediaStore().currentGlobalPlayerItem

    return {
      currentPlayerItem: currentPlayerItem,
      state: '',
      device: '',
      binding:'',
      artistName: '',
      trackName: '',
      artUri: '',
      trackPosition: 0,
      trackDuration: 0,
      volume: 0,
      deviceSelectorPopupOpened: false
    }
  },
  mounted () {
   
  },
  computed: {
    isPlaying () {
      this.decodeState()
      return this.state === 'PLAY'
    },
  },
  methods: {
    openDeviceSelectorPopup() {
      this.deviceSelectorPopupOpened = true
    },
    decodeState () {
      console.log("decodeState called for " + this.currentPlayerItem);
      const value = useStatesStore().trackedItems[this.currentPlayerItem].state
      
      console.log("value:" + JSON.stringify(useStatesStore().trackedItems));
      console.log("value:" + value);
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
      useStatesStore().sendCommand(this.currentPlayerItem, 'PREVIOUS')
    },
    rewind (value) {
      useStatesStore().sendCommand(this.currentPlayerItem, 'REWIND')
    },
    playPause (value) {
      useStatesStore().sendCommand(this.currentPlayerItem, this.isPlaying ? 'PAUSE' : 'PLAY')
    },
    fastForward (value) {
      useStatesStore().sendCommand(this.currentPlayerItem, 'FASTFORWARD')
    },
    skipNext (value) {
      useStatesStore().sendCommand(this.currentPlayerItem, 'NEXT')
    }

  }
}
</script>
