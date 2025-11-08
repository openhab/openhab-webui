<template>
  <f7-popup :opened="opened" @popup:closed="$emit('update:opened', false)"  :backdrop="true" :animate="true" :closeOnEscape="true" :push="false"
            :closeByBackdropClick="true" class="popup">
    <f7-view class="view-sheet-modal" url="/mediadeviceselector/" :animate="false">
      <f7-page>
            <media-device-selector @navigate="$emit('navigate', $event)" :player-item="playerItem" />
      </f7-page>
    </f7-view>
  </f7-popup>
</template>

<script>
import MediaDeviceSelector from '@/pages/media/media-device-selector.vue'

export default {
  name: 'MediaDeviceSelectorPopup',
  components: { 
    MediaDeviceSelector 
  },
  props: {
    opened: {
      type: Boolean,
      required: true
    },
    playerItem: {
      type: String,
      required: false
    }
  },
  methods: {
  }
}

</script>
