<template>
  <f7-popup :opened="false" @popup:closed="onClosed" :backdrop="true" :animate="true" :closeOnEscape="true" :push="false" :closeByBackdropClick="true" class="popup" >
    <f7-view class="view-sheet-modal" url="/mediadeviceselector/" :animate="false" >
        <f7-page>
          <media-device-selector  @navigate="onNavigate" />
        </f7-page>
    </f7-view>
  </f7-popup>
</template>

<script>
import MediaDeviceSelector from '@/pages/media/media-device-selector.vue'

export default {
  name: "MediaDevicePopup",
  components: { MediaDeviceSelector },
  props: {
      opened: {
      type: Boolean,
      required: false
    },
  },
  data () {
    return {
    }
  },

  methods: {
    onClosed() {
      this.$emit('closed')
    },
    onNavigate(path) {
      console.log("Navigating to:", path);
      // Emit the navigate event to the parent component
       this.$emit('navigate', path)
    }
  }
};

</script>
